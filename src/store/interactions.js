import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setContracts,
  setSymbols,
  balancesLoaded,
} from './reducers/tokens'

import {
  setContract,
  setAggregator,
  sharesLoaded,
  token1Loaded,
  token2Loaded,
  poolDAILoaded,
  poolWETHLoaded,
  poolDAI1Loaded,
  poolWETH1Loaded,
  swapsLoaded,
  depositRequest,
  depositSuccess,
  depositFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
  swapRequest,
  swapSuccess,
  swapFail
} from './reducers/amm'

import TOKEN_ABI from '../abis/Token.json';
import AMM_ABI from '../abis/AMM.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';
import config from '../config.json';

// --------------------------------------//
//    Load Provider, Network, Account    //
// --------------------------------------//

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  dispatch(setProvider(provider))

  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId))

  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

// --------------------------------------//
//           Load Token Pairs            //
// --------------------------------------//

// Load DAPP / USD Token Pair
export const loadTokens = async (provider, chainId, dispatch) => {
  const dapp = new ethers.Contract(config[chainId].dapp.address, TOKEN_ABI, provider)
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

  dispatch(setContracts([dapp, usd]))
  dispatch(setSymbols([await dapp.symbol(), await usd.symbol()]))
}

// Load APPL / USD Token Pair
export const loadAppleUSD = async (provider, chainId, dispatch) => {
  const apple = new ethers.Contract(config[chainId].apple.address, TOKEN_ABI, provider)
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

  dispatch(setContracts([apple, usd]))
  dispatch(setSymbols([await apple.symbol(), await usd.symbol()]))
}

// Load DAPP / APPL Token Pair
export const loadDAppApple = async (provider, chainId, dispatch) => {
  const dapp = new ethers.Contract(config[chainId].dapp.address, TOKEN_ABI, provider)
  const apple = new ethers.Contract(config[chainId].apple.address, TOKEN_ABI, provider)

  dispatch(setContracts([dapp, apple]))
  dispatch(setSymbols([await dapp.symbol(), await apple.symbol()]))
}

// Load DAI / WETH Token Pair
export const loadDaiWETH = async (provider, chainId, dispatch) => {
  const dai = new ethers.Contract(config[chainId].dai.address, TOKEN_ABI, provider)
  const weth = new ethers.Contract(config[chainId].weth.address, TOKEN_ABI, provider)

  dispatch(setContracts([dai, weth]))
  dispatch(setSymbols([await dai.symbol(), await weth.symbol()]))
}

// --------------------------------------//
//          Load Liquidity Pools         //
// --------------------------------------//

// Load (DAPP / USD) Address
export const loadDappDappUSD = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].dappDappUSD.address, AMM_ABI, provider)

  dispatch(setContract(amm))
  return amm
}

// Load (APPL / USD) Address
export const loadDappAppleUSD = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].dappAppleUSD.address, AMM_ABI, provider)

  dispatch(setContract(amm))
  return amm
}

// Load (DAPP / APPL) Address
export const loadDappDappApple = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].dappDappApple.address, AMM_ABI, provider)

  dispatch(setContract(amm))
  return amm
}

// Load Aggregator Address
export const loadAggregator = async (provider, chainId, dispatch) => {
  const aggregator = new ethers.Contract(config[chainId].aggregator.address, AGGREGATOR_ABI, provider)

  dispatch(setAggregator(aggregator))
  return aggregator
}

// --------------------------------------//
//        Load Balances and Shares       //
// --------------------------------------//

// Load Account Balances for Active Tokens, DAI, and WETH

export const loadBalances = async (_amm, tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account)
  const balance2 = await tokens[1].balanceOf(account)
 
  dispatch(balancesLoaded([
    ethers.utils.formatUnits(balance1.toString(), 'ether'),
    ethers.utils.formatUnits(balance2.toString(), 'ether')
  ]))

  const shares = await _amm.shares(account)
  dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')))

  const token1 = await _amm.token1Balance()
  dispatch(token1Loaded(ethers.utils.formatUnits(token1.toString(), 'ether')))

  const token2 = await _amm.token2Balance()
  dispatch(token2Loaded(ethers.utils.formatUnits(token2.toString(), 'ether')))

}

export const loadDaiWethBalances = async (_amm, dispatch) => {
  
  const poolDAI = await _amm.pool1daiBalance()
  dispatch(poolDAILoaded(ethers.utils.formatUnits(poolDAI.toString(), 'ether')))

  const poolWETH = await _amm.pool1wethBalance()
  dispatch(poolWETHLoaded(ethers.utils.formatUnits(poolWETH.toString(), 'ether')))

  const poolDAI1 = await _amm.pool2daiBalance()
  dispatch(poolDAI1Loaded(ethers.utils.formatUnits(poolDAI1.toString(), 'ether')))

  const poolWETH1 = await _amm.pool2wethBalance()
  dispatch(poolWETH1Loaded(ethers.utils.formatUnits(poolWETH1.toString(), 'ether')))
  
}

// --------------------------------------//
//         Add / Remove Liquidity        //
// --------------------------------------//

// Add Liquidity (Deposit Funcion)
export const addLiquidity = async (provider, amm, tokens, amounts, dispatch) => {
  try {
    dispatch(depositRequest())

    const signer = await provider.getSigner()

    let transaction

    transaction = await tokens[0].connect(signer).approve(amm.address, amounts[0])
    await transaction.wait()

    transaction = await tokens[1].connect(signer).approve(amm.address, amounts[1])
    await transaction.wait()

    transaction = await amm.connect(signer).addLiquidity(amounts[0], amounts[1])
    await transaction.wait()

    dispatch(depositSuccess(transaction.hash))
  } catch (error) {
    dispatch(depositFail())
  }
}

// Remove Liquidity (Withdraw Function)
export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  try {
    dispatch(withdrawRequest())

    const signer = await provider.getSigner()

    let transaction = await amm.connect(signer).removeLiquidity(shares)
    await transaction.wait()

    dispatch(withdrawSuccess(transaction.hash))
  } catch (error) {
    dispatch(withdrawFail())
  }
}

// --------------------------------------//
//              Manage Swaps             //
// --------------------------------------//

// Swap Functionality
export const swap = async (provider, _amm, token1, inputSymbol, outputSymbol, amount, dispatch) => {
  try {

    dispatch(swapRequest())

    let transaction
    const signer = await provider.getSigner()

    transaction = await token1.connect(signer).approve(_amm.address, amount)
    await transaction.wait()

  if ((inputSymbol === "DAI") && (outputSymbol === "WETH"))  {
      transaction = await _amm.connect(signer).uniswap1(amount)
    } else if ((inputSymbol === "WETH") && (outputSymbol === "DAI")) {
      transaction = await _amm.connect(signer).uniswap2(amount)
    } else if ((inputSymbol === "DAPP") || (inputSymbol === "APPL" && outputSymbol === "USD")) {
      transaction = await _amm.connect(signer).swapToken1(amount)
    } else {
      transaction = await _amm.connect(signer).swapToken2(amount)
    }

    dispatch(swapSuccess(transaction.hash))

  } catch (error) {
    dispatch(swapFail())
  }
}

// Load All Swaps
export const loadAllSwaps = async (provider, amm, dispatch) => {
  const block = await provider.getBlockNumber()

  const swapStream = await amm.queryFilter('Swap', 0, block)
  const swaps = swapStream.map(event => {
    return { hash: event.transactionHash, args: event.args }
  })

  dispatch(swapsLoaded(swaps))
}
