import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation'
import Tabs from './Tabs'
import Swap from './Swap'
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import Charts from './Charts'

import Button from 'react-bootstrap/Button'

import wethIcon from '../WETH.png'
import daiIcon from '../DAI.png'
import dappIcon from '../logo.png'
import usdIcon from '../T2-Icon.jpg'
import appleIcon from '../T3-Icon.jpg'

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

// ABIs: Import your contract ABIs here
import AMM_ABI from '../abis/AMM.json'
import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadAMM,
} from '../store/interactions'

function App() {

  // Set Token Addresses
  const [usd, setUSD] = useState(null)
  const [dapp, setDapp] = useState(null)
  const [apple, setApple] = useState(null)

  // Set rate values for each trading pair
  const [rate1, setRate1] = useState(null)
  const [rate2, setRate2] = useState(null)
  const [rate3, setRate3] = useState(null)

    // Set Address for DAPP / USD Pool
    const [amm, setAMM] = useState(null)

    // Set Address for APPL / USD Pool
    const [dappAppleUSD, setDappAppleUSD] = useState(null)
    
    // Set Address for DAPP / APPL Pool
    const [dappDappApple, setDappDappApple] = useState(null)

    // Load DAI/WETH Balances from Mainnet
    const poolDAI = useSelector(state => state.amm.poolDAI)
    const poolWETH = useSelector(state => state.amm.poolWETH)

    // Call balances for DAPP / USD
    // const token1 = useSelector(state => state.amm.token1)
    // const token2 = useSelector(state => state.amm.token2)

    const [account, setAccount] = useState(null)

    // Set Balances for DAPP / USD
    const [balance1, setBalance1] = useState(0)
    const [balance2, setBalance2] = useState(0)

    // Load Account APPL Balance Individually
    const [dappAccountBalance, setDappAccountBalance] = useState(0)
    const [usdAccountBalance, setUSDAccountBalance] = useState(0)
    const [appleAccountBalance, setAppleAccountBalance] = useState(0)

    // Set Balances for APPL / USD
    const [appleBalance, setAppleBalance] = useState(0)
    const [usdBalance, setUSDBalance] = useState(0)

    // Set Balances for DAPP / APPL
    const [dappBalance, setDappBalance] = useState(0)
    const [appleBalance2, setAppleBalance2] = useState(0)

    // Set Chain ID for Network
    const chainId = useSelector(state => state.provider.chainId)

    const dispatch = useDispatch()

const loadBlockchainData = async () => {

    // Initiate provider
      const provider = await loadProvider(dispatch)

    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
      const chainId = await loadNetwork(provider, dispatch)

    // Load User Account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)

    // Reload page when network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })

    // Fetch current account from Metamask when changed
      window.ethereum.on('accountsChanged', async () => {
        await loadAccount(dispatch)
      })

    // Initiate contracts
      await loadTokens(provider, chainId, dispatch)
      await loadAMM(provider, chainId, dispatch)

    // Load tokens
      let usd = new ethers.Contract(config[1].usd.address, TOKEN_ABI, provider)
      setUSD(usd)

      let dapp = new ethers.Contract(config[1].dapp.address, TOKEN_ABI, provider)
      setDapp(dapp)

      let apple = new ethers.Contract(config[1].apple.address, TOKEN_ABI, provider)
      setApple(apple)
    
    // Load APPL Balance Individually
      let dappAccountBalance = await dapp.balanceOf(accounts[0])
      dappAccountBalance = ethers.utils.formatUnits(dappAccountBalance, 18)
      setDappAccountBalance(dappAccountBalance)

      let usdAccountBalance = await usd.balanceOf(accounts[0])
      usdAccountBalance = ethers.utils.formatUnits(usdAccountBalance, 18)
      setUSDAccountBalance(usdAccountBalance)

      let appleAccountBalance = await apple.balanceOf(accounts[0])
      appleAccountBalance = ethers.utils.formatUnits(appleAccountBalance, 18)
      setAppleAccountBalance(appleAccountBalance)

    // Load Dapp DAPP / USD Pool Address
      const amm = new ethers.Contract(config[1].amm.address, AMM_ABI, provider)
      setAMM(amm)

    // Load Dapp APPL / USD Pool Address
      const dappAppleUSD = new ethers.Contract(config[1].dappAppleUSD.address, AMM_ABI, provider)
      setDappAppleUSD(dappAppleUSD)

    // Load Dapp DAPP / APPL Pool Address
      const dappDappApple = new ethers.Contract(config[1].dappDappApple.address, AMM_ABI, provider)
      setDappDappApple(dappDappApple)

    // Load Balances for DAPP / USD
      let balance1 = await dapp.balanceOf(amm.address)
      balance1 = ethers.utils.formatUnits(balance1, 18)
      setBalance1(balance1)

      let balance2 = await usd.balanceOf(amm.address)
      balance2 = ethers.utils.formatUnits(balance2, 18)
      setBalance2(balance2)

    // Load Balances for APPL / USD
      let appleBalance = await apple.balanceOf(dappAppleUSD.address)
      appleBalance = ethers.utils.formatUnits(appleBalance, 18)
      setAppleBalance(appleBalance)

      let usdBalance = await usd.balanceOf(dappAppleUSD.address)
      usdBalance = ethers.utils.formatUnits(usdBalance, 18)
      setUSDBalance(usdBalance)

    // Load Balances for DAPP / APPL
      let dappBalance = await dapp.balanceOf(dappDappApple.address)
      dappBalance = ethers.utils.formatUnits(dappBalance, 18)
      setDappBalance(dappBalance)

      let appleBalance2 = await apple.balanceOf(dappDappApple.address)
      appleBalance2 = ethers.utils.formatUnits(appleBalance2, 18)
      setAppleBalance2(appleBalance2)

      setRate1((balance2 / balance1))
      setRate2((usdBalance / appleBalance))
      setRate3((appleBalance2 / dappBalance))
  }

  const testHandler = async (e) => {
      console.log("Testing...")
  }

  useEffect(() => {
    loadBlockchainData()
  }, []);

  return(
    <Container>
      <HashRouter>

        <Navigation />
        <hr />
<hr className="hr hr-blurry" />
    <Row>
      <Col>
        <h5 className='my-4 text-left'>
        <img
                alt="dapptoken"
                src={dappIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        DAPP in DAPP / USD Liquidity: <strong>{parseFloat(balance1).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>
        <img
                alt="usdtoken"
                src={usdIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        USD in DAPP / USD Liquidity: <strong>{parseFloat(balance2).toFixed(2)}</strong> tokens</h5>
        <h5> Exchange Rate: {parseFloat(rate1).toFixed(2)}</h5>
      </Col>
      <Col>
        <h5 className='my-4 text-left'>
        <img
                alt="appletoken"
                src={appleIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        APPL in APPL / USD Liquidity: <strong>{parseFloat(appleBalance).toFixed(2)}</strong></h5>
        <h5 className='my-4 text-left'>
        <img
                alt="usdtoken"
                src={usdIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        USD in APPL / USD Liquidity: <strong>{parseFloat(usdBalance).toFixed(2)}</strong></h5>
        <h5> Exchange Rate: {parseFloat(rate2).toFixed(2)}</h5>
      </Col>
    </Row>
<hr className="hr hr-blurry" />
        <h5 className='my-4 text-left'>
        <img
                alt="dapptoken"
                src={dappIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        DAPP in DAPP / APPL Liquidity: <strong>{parseFloat(dappBalance).toFixed(2)}</strong></h5>
        <h5 className='my-4 text-left'>
        <img
                alt="appletoken"
                src={appleIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        APPL in DAPP / APPL Liquidity: <strong>{parseFloat(appleBalance2).toFixed(2)}</strong></h5>
        <h5> Exchange Rate: {parseFloat(rate3).toFixed(2)}</h5>
<hr className="hr hr-blurry" />
        <h5 className='my-4 text-left'>
        <img
                alt="daitoken"
                src={daiIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
          Total DAI in Uniswap: <strong>{parseFloat(poolDAI).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>
        <img
                alt="wethtoken"
                src={wethIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
          Total WETH in Uniswap: <strong>{parseFloat(poolWETH).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>DAI/WETH Rate: <strong>{parseFloat(poolDAI / poolWETH).toFixed(2)}</strong></h5>
  <hr className="hr hr-blurry" />

              <p>
                <Button 
                  variant="primary" 
                  style={{ width: '20%' }}
                  onClick={() => testHandler()}
                  >
                  Test Button 
                </Button>
              </p>

        <Tabs />

        <Routes>
          <Route exact path="/" element={<Swap 
                                          dappAccountBalance={dappAccountBalance}
                                          usdAccountBalance={usdAccountBalance}
                                          appleAccountBalance={appleAccountBalance}
                                          rate1={rate1}
                                          rate2={rate2}
                                          rate3={rate3}
                                          />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
        
      </HashRouter>
    </Container>

  )
}

export default App;
