const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('AMM', () => {
  let accounts,
  	  deployer,
  	  liquidityProvider,
      investor1,
      investor2
  	  
let   token1,
  	  token2,
  	  amm

  beforeEach(async () => {
  	// Setup Accounts
  	accounts = await ethers.getSigners()
    deployer = accounts[0]
    liquidityProvider = accounts[1]
    investor1 = accounts[2]
    investor2 = accounts[3]

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000') // 1 MILLION omg
    token2 = await Token.deploy('USD Token', 'USD', '1000000') // 1 MILLION omfg

    // Send tokens to liquidity provider
    let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
    await transaction.wait()

    transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
    await transaction.wait()

    // Send token1 to investor1
    transaction = await token1.connect(deployer).transfer(investor1.address, tokens(100000))
    await transaction.wait()

    // Send token2 to investor2
    transaction = await token2.connect(deployer).transfer(investor2.address, tokens(100000))
    await transaction.wait()

    // Deploy AMM
    const AMM = await ethers.getContractFactory('AMM')
    amm = await AMM.deploy(token1.address, token2.address)

  })

  describe('Deployment', () => {

  	it('had an address', async () => {
  		expect(amm.address).to.not.equal(0x0)
  	})

  	it('returns token1', async () =>{
  		expect(await amm.token1()).to.equal(token1.address)
  	})

  	it('returns token1', async () =>{
  		expect(await amm.token2()).to.equal(token2.address)
  	})

  })

    describe('Swapping Tokens', () => {

    let amount, transaction, result, estimate, balance

  	it('facilitates swaps', async () => {
  		
  		// Deployer approves 100k tokens
  		let amount = tokens(100000)
  		transaction = await token1.connect(deployer).approve(amm.address, amount)
  		await transaction.wait()

  		transaction = await token2.connect(deployer).approve(amm.address, amount)
  		await transaction.wait()

  		// Deployer adds liquidity
  		transaction = await amm.connect(deployer).addLiquidity(amount, amount)
  		await transaction.wait()

  		// Check AMM receives GAY tokens
  		// Check to make sure AMM smart contract received funds - GAY!
  		expect(await token1.balanceOf(amm.address)).to.equal(amount)
  		expect(await token2.balanceOf(amm.address)).to.equal(amount)

  		expect(await amm.token1Balance()).to.equal(amount)
  		expect(await amm.token2Balance()).to.equal(amount)

  		// Check deployer has 100 GAY shares
  		expect(await amm.shares(deployer.address)).to.equal(tokens(100)) // use tokens helper to calculate

   		// Check deployer has 100 total GAY shares
  		expect(await amm.totalShares()).to.equal(tokens(100)) // use tokens helper to calculate

      //////////////////////////////////////////////////////////////////
      // Liquidity-providers add more liquidity
      //

      // LP approves 50k tokens
      amount = tokens(50000)
      transaction = await token1.connect(liquidityProvider).approve(amm.address, amount)
      await transaction.wait()

      transaction = await token2.connect(liquidityProvider).approve(amm.address, amount)
      await transaction.wait()

      // Calculate token2 deposit amount
      let token2Deposit = await amm.calculateToken2Deposit(amount)

      // LP adds liquidity
      transaction = await amm.connect(liquidityProvider).addLiquidity(amount, token2Deposit)
      await transaction.wait()

      // Check that the liquidity provider has the correct amount of shares BIATCH LOLZ
      expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50))

      // Deployer should still have 100 GAY shares
      expect(await amm.shares(deployer.address)).to.equal(tokens(100))

      // Pool should have 150 VERY GAY shares
      expect(await amm.totalShares()).to.equal(tokens(150))

      //////////////////////////////////////////////////////////////////
      // Investor 1 Swaps
      //

      // Check price BEFORE swapping (should be 1 bitch, ONE)
      console.log(`Price: ${await amm.token2Balance() / await amm.token1Balance()}\n`)
      

      // Approve ALL the tokens!!
      transaction = await token1.connect(investor1).approve(amm.address, tokens(100000))
      await transaction.wait()

      // Check investor1 balance before swap
      balance = await token2.balanceOf(investor1.address)
      console.log(`investor1 token2 balance BEFORE swap: ${ethers.utils.formatEther(balance)}\n`)

      // Estimate amount of tokens investor1 will receive after swapping - including SLIPPAGE (whoa)
      estimate = await amm.calculateToken1Swap(tokens(1))
      console.log(`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

      // Investor1 swaps 1 token1
      transaction = await amm.connect(investor1).swapToken1(tokens(1))
      result = await transaction.wait()


      // Check swap event
      await expect(transaction).to.emit(amm, 'Swap').withArgs(
          investor1.address,
          token1.address,
          tokens(1),
          token2.address,
          estimate,
          await amm.token1Balance(),
          await amm.token2Balance(),
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )


      // Checkinvestor1 balance after swap - make sure they receive the SAME amount estimated by the UI
      balance = await token2.balanceOf(investor1.address)
      console.log(`Token2 amount investor1 balance after swap: ${ethers.utils.formatEther(estimate)}\n`)
      expect(estimate).to.equal(balance)

      // AMM token balances must be in sync
      expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
      expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

      // Check price afer swapping, AFTER BRO

      console.log(`AFTER Price: ${await amm.token2Balance() / await amm.token1Balance()}\n`)

      //////////////////////////////////////////////////////////////////
      // Investor 1 Swaps AGAIN
      //


      // Swap some more tokens to see what happens
      balance = await token2.balanceOf(investor1.address)
      console.log(`investor1 token2 balance BEFORE swap: ${ethers.utils.formatEther(balance)}\n`)

      estimate = await amm.calculateToken1Swap(tokens(1))
      console.log(`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

      // Investor swaps 1 token
      transaction = await amm.connect(investor1).swapToken1(tokens(1))
      await transaction.wait()

      // Check investor1 balance after swap
      balance = await token2.balanceOf(investor1.address)
      console.log(`investor1 token2 balance after swap: ${ethers.utils.formatEther(balance)}\n`)

      // AMM token balances must be in sync
      expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
      expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

      // Check price after swapping
      console.log(`Price: ${await amm.token2Balance() / await amm.token1Balance()}\n`)


      //////////////////////////////////////////////////////////////////
      // Investor 1 Swaps a large amaount - I'LL BUY IT AT A HIGH PRICE
      //

      // Check investor balance before swap
      balance = await token2.balanceOf(investor1.address)
      console.log(`investor1 token2 balance BEFORE swap: ${ethers.utils.formatEther(balance)}\n`)

      estimate = await amm.calculateToken1Swap(tokens(100))
      console.log(`Token2 amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

      // Investor swaps 1 token
      transaction = await amm.connect(investor1).swapToken1(tokens(100))
      await transaction.wait()

      // Check investor1 balance after swap
      balance = await token2.balanceOf(investor1.address)
      console.log(`investor1 token2 balance after swap: ${ethers.utils.formatEther(balance)}\n`)

      // AMM token balances must be in sync
      expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
      expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

      // Check price after swapping
      console.log(`Price: ${await amm.token2Balance() / await amm.token1Balance()}\n`)


      //////////////////////////////////////////////////////////////////
      // Investor 2 Swaps
      //

      // Investor2 approves all tokens
      transaction = await token2.connect(investor2).approve(amm.address, tokens(100000))
      await transaction.wait()

      // Check investor2 balance BEFORE swap occurs
      balance = await token1.balanceOf(investor2.address)
      console.log(`investor2 token1 balance BEFORE swap: ${ethers.utils.formatEther(balance)}\n`)

      // Estimate amount of tokens investor2 will receive after swapping token2: inclues slippage
      estimate = await amm.calculateToken2Swap(tokens(1))
      console.log(`Token1 amount investor2 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

      // Investor2 swaps 1 token
      transaction = await amm.connect(investor2).swapToken2(tokens(1))
      await transaction.wait()

      // Check swap event
      await expect(transaction).to.emit(amm, 'Swap').withArgs(
          investor2.address,
          token2.address,
          tokens(1),
          token1.address,
          estimate,
          await amm.token1Balance(),
          await amm.token2Balance(),
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )

      // Check investor2 balance after swap
      balance = await token1.balanceOf(investor2.address)
      console.log(`Investor2 Token1 balance after swap: ${ethers.utils.formatEther(balance)}\n`)
      expect(estimate).to.equal(balance)

      // AMM token balances must be in sync
      expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
      expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

      // Check price afer swapping, AFTER BRO

      console.log(`AFTER Price: ${await amm.token2Balance() / await amm.token1Balance()}\n`)

      //////////////////////////////////////////////////////////////////
      // Investor 2 Swaps
      //

      console.log(`AMM Token1 Balance: ${ethers.utils.formatEther(await amm.token1Balance())} \n`)
      console.log(`AMM Token2 Balance: ${ethers.utils.formatEther(await amm.token2Balance())} \n`)

      // Check LP balance before removing tokens
      balance = await token1.balanceOf(liquidityProvider.address)
      console.log(`Liquidity Provider Token1 balance BEFORE removing funds: ${ethers.utils.formatEther(balance)} \n`)

      balance = await token2.balanceOf(liquidityProvider.address)
      console.log(`Liquidity Provider Token2 balance BEFORE removing funds: ${ethers.utils.formatEther(balance)} \n`)

      // LP removes tokens from AMM pool
      transaction = await amm.connect(liquidityProvider).removeLiquidity(tokens(50))
      await transaction.wait()

      balance = await token1.balanceOf(liquidityProvider.address)
      console.log(`Liquidity Provider Token1 balance after removing GAY funds: ${ethers.utils.formatEther(balance)} \n`)

      balance = await token2.balanceOf(liquidityProvider.address)
      console.log(`Liquidity Provider Token1 balance after removing GAY funds: ${ethers.utils.formatEther(balance)} \n`)

      // LP should have 0 shares
      expect(await amm.shares(liquidityProvider.address)).to.equal(0)

      // Deployer should have 100 shares
      expect(await amm.shares(deployer.address)).to.equal(tokens(100))

      expect(await amm.totalShares()).to.equal(tokens(100))

      await amm.token1Balance()
      await amm.token2Balance()



  	})

  })

})
