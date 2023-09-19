import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setContracts,
  setSymbols,
  balancesLoaded
} from './reducers/tokens'

import {
  setContract,
  sharesLoaded,
  token1Loaded,
  token2Loaded,
  token3Loaded,
  token4Loaded,
  token5Loaded,
  token6Loaded,
  poolDAILoaded,
  poolWETHLoaded,
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
import config from '../config.json';

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

// ------------------------------------------------------------------------------
// LOAD CONTRACTS
export const loadTokens = async (provider, chainId, dispatch) => {
  const dapp = new ethers.Contract(config[chainId].dapp.address, TOKEN_ABI, provider)
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

  // Change contract values as neeeded here

  dispatch(setContracts([dapp, usd]))
  dispatch(setSymbols([await dapp.symbol(), await usd.symbol()]))
}

export const loadAMM = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].amm.address, AMM_ABI, provider)

  dispatch(setContract(amm))

  return amm
}

export const loadDappAppleUSD = async (provider, chainId, dispatch) => {
  const dappAppleUSD = new ethers.Contract(config[chainId].dappAppleUSD.address, AMM_ABI, provider)

  dispatch(setContract(dappAppleUSD))

  return dappAppleUSD
}

export const loadAppleswap = async (provider, chainId, dispatch) => {
  const appleswap = new ethers.Contract(config[chainId].appleswap.address, AMM_ABI, provider)

  dispatch(setContract(appleswap))

  return appleswap
}

// ------------------------------------------------------------------------------
// LOAD BALANCES & SHARES
export const loadBalances = async (amm, tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account)
  const balance2 = await tokens[1].balanceOf(account)

  dispatch(balancesLoaded([
    ethers.utils.formatUnits(balance1.toString(), 'ether'),
    ethers.utils.formatUnits(balance2.toString(), 'ether')
  ]))

  const shares = 100 // await amm.shares(account)
  dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')))

  const token1 = await amm.token1Balance()
  dispatch(token1Loaded(ethers.utils.formatUnits(token1.toString(), 'ether')))

  const token2 = await amm.token2Balance()
  dispatch(token2Loaded(ethers.utils.formatUnits(token2.toString(), 'ether')))

  const poolDAI = await amm.poolDAIbalance()
  dispatch(poolDAILoaded(ethers.utils.formatUnits(poolDAI.toString(), 'ether')))

  const poolWETH = await amm.poolWETHbalance()
  dispatch(poolWETHLoaded(ethers.utils.formatUnits(poolWETH.toString(), 'ether')))
}

export const loadDappAppleUSDBalances = async (dappAppleUSD, tokens, account, dispatch) => {

  const token5 = await dappAppleUSD.token1Balance()
  dispatch(token5Loaded(ethers.utils.formatUnits(token5.toString(), 'ether')))

  const token6 = await dappAppleUSD.token2Balance()
  dispatch(token6Loaded(ethers.utils.formatUnits(token6.toString(), 'ether')))


}




export const loadBalances1 = async (appleswap, tokens, account, dispatch) => {

  const token3 = await appleswap.token1Balance()
  dispatch(token3Loaded(ethers.utils.formatUnits(token3.toString(), 'ether')))

  const token4 = await appleswap.token2Balance()
  dispatch(token4Loaded(ethers.utils.formatUnits(token4.toString(), 'ether')))

}




// ------------------------------------------------------------------------------
// ADD LIQUDITY
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

// ------------------------------------------------------------------------------
// REMOVE LIQUDITY
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

// ------------------------------------------------------------------------------
// SWAP

export const swap = async (provider, amm, token, symbol, amount, dispatch) => {
  try {

    dispatch(swapRequest())

    let transaction

    const signer = await provider.getSigner()

    transaction = await token.connect(signer).approve(amm.address, amount)
    await transaction.wait()

    if (symbol === "DAPP") {
      transaction = await amm.connect(signer).swapToken1(amount)
    } else {
      transaction = await amm.connect(signer).swapToken2(amount)
    }

    await transaction.wait()

    // Tell redux that the swap has finished - MISSION COMPLETE

    dispatch(swapSuccess(transaction.hash))

  } catch (error) {
    dispatch(swapFail())
  }
}


// ------------------------------------------------------------------------------
// LOAD ALL SWAPS

export const loadAllSwaps = async (provider, amm, dispatch) => {
  const block = await provider.getBlockNumber()

  const swapStream = await amm.queryFilter('Swap', 0, block)
  const swaps = swapStream.map(event => {
    return { hash: event.transactionHash, args: event.args }
  })

  dispatch(swapsLoaded(swaps))
}

// ------------------------------------------------------------------------------
// FETCH AMM BALANCES

export const fetchBalance1 = async (provider, amm, dispatch) => {

}
