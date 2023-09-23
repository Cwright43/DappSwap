// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

async function main() {

  // Fetch accounts
  console.log(`Fetching accounts & network \n`)
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const investor1 = accounts[1]
  const investor2 = accounts[2]
  const investor3 = accounts[3]
  const investor4 = accounts[4]

  // Fetch Network
  const { chainId } = await ethers.provider.getNetwork()

  console.log(`Fetching token and transferring to accounts...\n`)

  // Fetch Dapp Token
  const dapp = await ethers.getContractAt('Token', config[chainId].dapp.address)
  console.log(`Dapp Token fetched: ${dapp.address}\n`)

  // Fetch USD Token
  const usd = await ethers.getContractAt('Token', config[chainId].usd.address)
  console.log(`USD Token fetched: ${usd.address}\n`)

  // Fetch Apple Token
  const apple = await ethers.getContractAt('Token', config[chainId].apple.address)
  console.log(`Apple Token fetched: ${apple.address}\n`)


  /////////////////////////////////////////////////////////////
  // Distribute Tokens to Investors
  //

  let transaction

  // Send dapp tokens to investor 1
  transaction = await dapp.connect(deployer).transfer(investor1.address, tokens(10))
  await transaction.wait()

  // Send usd tokens to investor 2
  transaction = await usd.connect(deployer).transfer(investor2.address, tokens(10))
  await transaction.wait()

  // Send dapp tokens to investor 3
  transaction = await dapp.connect(deployer).transfer(investor3.address, tokens(10))
  await transaction.wait()

  // Send usd tokens to investor 4
  transaction = await usd.connect(deployer).transfer(investor4.address, tokens(10))
  await transaction.wait()


  /////////////////////////////////////////////////////////////
  // Adding Liquidity
  //

  let amount = tokens(100)
  let amount1 = tokens(200)
  let amount2 = tokens(300)
  let amount3 = tokens(400)
  let amount4 = tokens(500)
  let amount5 = tokens(600)

  console.log(`Fetching AppleSwap...\n`)

  // Fetch AMM
  const amm = await ethers.getContractAt('AMM', config[chainId].amm.address)
  console.log(`AMM Swap fetched: ${amm.address}\n`)

  // Fetch AppleSwap
  const appleswap = await ethers.getContractAt('AMM', config[chainId].appleswap.address)
  console.log(`AppleSwap fetched: ${appleswap.address}\n`)

  // Fetch Aggregator
  const aggregator = await ethers.getContractAt('AMM', config[chainId].aggregator.address)
  console.log(`Aggregator fetched: ${aggregator.address}\n`)

  // Fetch APPL / USD Pool on Dapp Swap
  const dappAppleUSD = await ethers.getContractAt('AMM', config[chainId].dappAppleUSD.address)
  console.log(`APPL / USD Pool on Dapp Swap fetched: ${dappAppleUSD.address}\n`)

  // Fetch APPL / USD Pool on Apple Swap
  const appleAppleUSD = await ethers.getContractAt('AMM', config[chainId].appleAppleUSD.address)
  console.log(`APPL / USD Pool on Apple Swap fetched: ${appleAppleUSD.address}\n`)

  // Fetch DAPP / APPLE Pool on Dapp Swap
  const dappDappApple = await ethers.getContractAt('AMM', config[chainId].dappDappApple.address)
  console.log(`DAPP / APPL Pool on Dapp Swap fetched: ${dappDappApple.address}\n`)

  // Fetch DAPP / APPLE Pool on Apple Swap
  const appleDappApple = await ethers.getContractAt('AMM', config[chainId].appleDappApple.address)
  console.log(`DAPP / APPL Pool on Apple Swap fetched: ${appleDappApple.address}\n`)

  // Add liquidity to Aggregator

  transaction = await dapp.connect(deployer).approve(aggregator.address, amount1)
  await transaction.wait()

  transaction = await usd.connect(deployer).approve(aggregator.address, amount1)
  await transaction.wait()

  console.log(`Adding liquidity...\n`)
  transaction = await aggregator.connect(deployer).addLiquidity(amount1, amount1)
  await transaction.wait()


  // Add liquidity to DAPP / USD on Dapp Swap

  transaction = await dapp.connect(deployer).approve(amm.address, amount)
  await transaction.wait()

  transaction = await usd.connect(deployer).approve(amm.address, amount)
  await transaction.wait()

  console.log(`Adding liquidity...\n`)
  transaction = await amm.connect(deployer).addLiquidity(amount, amount)
  await transaction.wait()

  // Add liquidity to DAPP / USD on Apple Swap

  transaction = await dapp.connect(deployer).approve(appleswap.address, amount1)
  await transaction.wait()

  transaction = await usd.connect(deployer).approve(appleswap.address, amount1)
  await transaction.wait()

  console.log(`Adding liquidity...\n`)
  transaction = await appleswap.connect(deployer).addLiquidity(amount1, amount1)
  await transaction.wait()

   // Add liquidity to APPL / USD on Dapp Swap

  transaction = await apple.connect(deployer).approve(dappAppleUSD.address, amount2)
  await transaction.wait()

  transaction = await usd.connect(deployer).approve(dappAppleUSD.address, amount2)
  await transaction.wait()

  console.log(`Adding liquidity...\n`)
  transaction = await dappAppleUSD.connect(deployer).addLiquidity(amount2, amount2)
  await transaction.wait()

   // Add liquidity to APPL / USD on Apple Swap

   transaction = await apple.connect(deployer).approve(appleAppleUSD.address, amount3)
   await transaction.wait()
 
   transaction = await usd.connect(deployer).approve(appleAppleUSD.address, amount3)
   await transaction.wait()
 
   console.log(`Adding liquidity...\n`)
   transaction = await appleAppleUSD.connect(deployer).addLiquidity(amount3, amount3)
   await transaction.wait()

   // Add liquidity to DAPP / APPL on Dapp Swap

   transaction = await dapp.connect(deployer).approve(dappDappApple.address, amount4)
   await transaction.wait()
 
   transaction = await apple.connect(deployer).approve(dappDappApple.address, amount4)
   await transaction.wait()
 
   console.log(`Adding liquidity...\n`)
   transaction = await dappDappApple.connect(deployer).addLiquidity(amount4, amount4)
   await transaction.wait()
 
    // Add liquidity to DAPP / APPL on Apple Swap
 
    transaction = await dapp.connect(deployer).approve(appleDappApple.address, amount5)
    await transaction.wait()
  
    transaction = await apple.connect(deployer).approve(appleDappApple.address, amount5)
    await transaction.wait()
  
    console.log(`Adding liquidity...\n`)
    transaction = await appleDappApple.connect(deployer).addLiquidity(amount5, amount5)
    await transaction.wait()

  // Add DEX addresses to mapping list

  transaction = await aggregator.addDEXList(amm.address)
  await transaction.wait()

  console.log(`DappSwap @ ${amm.address} added to DEX mapping...\n`)

  transaction = await aggregator.addDEXList(appleswap.address)
  await transaction.wait()

  console.log(`AppleSwap @ ${appleswap.address} added to DEX mapping...\n`)


  // Add DEX addresses to mapping list

  transaction = await amm.addDEXList(amm.address)
  await transaction.wait()

  console.log(`DappSwap @ ${amm.address} added to DEX mapping...\n`)

  transaction = await amm.addDEXList(appleswap.address)
  await transaction.wait()

  console.log(`AppleSwap @ ${appleswap.address} added to DEX mapping...\n`)

  /////////////////////////////////////////////////////////////
  // Investor 1 Swaps: Dapp --> USD
  //

  console.log(`Investor 1 Swaps...\n`)

  // Investor approves all tokens
  transaction = await dapp.connect(investor1).approve(amm.address, tokens(10))
  await transaction.wait()

  // Investor swaps 1 token
  transaction = await amm.connect(investor1).swapToken1(tokens(1))
  await transaction.wait()

  /////////////////////////////////////////////////////////////
  // Investor 2 Swaps: USD --> Dapp
  //

  console.log(`Investor 2 Swaps...\n`)
  // Investor approves all tokens tokens
  transaction = await usd.connect(investor2).approve(amm.address, tokens(10))
  await transaction.wait()

  // Investor swaps 1 token
  transaction = await amm.connect(investor2).swapToken2(tokens(1))
  await transaction.wait()


  /////////////////////////////////////////////////////////////
  // Investor 3 Swaps: Dapp --> USD
  //

  console.log(`Investor 3 Swaps...\n`)

  // Investor approves all tokens
  transaction = await dapp.connect(investor3).approve(amm.address, tokens(10))
  await transaction.wait()

  // Investor swaps all 10 token
  transaction = await amm.connect(investor3).swapToken1(tokens(10))
  await transaction.wait()

  /////////////////////////////////////////////////////////////
  // Investor 4 Swaps: USD --> Dapp
  //

  console.log(`Investor 4 Swaps...\n`)

  // Investor approves all tokens
  transaction = await usd.connect(investor4).approve(amm.address, tokens(10))
  await transaction.wait()

  // Investor swaps all 10 tokens
  transaction = await amm.connect(investor4).swapToken2(tokens(5))
  await transaction.wait()

  console.log(`Finished.\n`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
