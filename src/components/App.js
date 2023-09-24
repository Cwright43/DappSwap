import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Swap from './Swap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Charts from './Charts';

import Button from 'react-bootstrap/Button' 
import Card from 'react-bootstrap/Card' 
import Collapse from 'react-bootstrap/Collapse' 
import ListGroup from 'react-bootstrap/ListGroup'

import wethIcon from '../WETH.png';
import daiIcon from '../DAI.png';
import dappIcon from '../logo.png';
import usdIcon from '../T2-Icon.jpg';
import appleIcon from '../T3-Icon.jpg';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// ABIs: Import your contract ABIs here
import AMM_ABI from '../abis/AMM.json'
import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadAMM
} from '../store/interactions'

function App() {

  const [tokenBalance, setTokenBalance] = useState(0)

  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);

  const [usd, setUSD] = useState(null)
  const [dapp, setDapp] = useState(null)
  const [apple, setApple] = useState(null)

  const [dappAppleUSD, setDappAppleUSD] = useState(null)
  const [dappDappApple, setDappDappApple] = useState(null)

  // Load DAI/WETH pool from Mainnet

  const poolDAI = useSelector(state => state.amm.poolDAI)
  const poolWETH = useSelector(state => state.amm.poolWETH)

  // Load

  const token1 = useSelector(state => state.amm.token1)
  const token2 = useSelector(state => state.amm.token2)

  // Load 

  const [appleBalance, setAppleBalance] = useState(0)
  const [usdBalance2, setUSDBalance2] = useState(0)

  const [dappBalance, setDappBalance] = useState(0)
  const [appleBalance2, setAppleBalance2] = useState(0)

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Initiate provider
    const provider = await loadProvider(dispatch)

    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

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

    // Load Dapp APPL / USD trading pair

    const dappAppleUSD = new ethers.Contract(config[1].dappAppleUSD.address, AMM_ABI, provider)
    setDappAppleUSD(dappAppleUSD)

    const dappDappApple = new ethers.Contract(config[1].dappDappApple.address, AMM_ABI, provider)
    setDappDappApple(dappDappApple)

    // Load APPL balance for Dapp Swap

    let appleBalance = await apple.balanceOf(dappAppleUSD.address)
    appleBalance = ethers.utils.formatUnits(appleBalance, 18)
    setAppleBalance(appleBalance)

    let usdBalance2 = await usd.balanceOf(dappAppleUSD.address)
    usdBalance2 = ethers.utils.formatUnits(usdBalance2, 18)
    setUSDBalance2(usdBalance2)


    let dappBalance = await dapp.balanceOf(dappDappApple.address)
    dappBalance = ethers.utils.formatUnits(dappBalance, 18)
    setDappBalance(dappBalance)

    let appleBalance2 = await apple.balanceOf(dappDappApple.address)
    appleBalance2 = ethers.utils.formatUnits(appleBalance2, 18)
    setAppleBalance2(appleBalance2)

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
        DAPP in DAPP / USD Liquidity: <strong>{parseFloat(token1).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>
        <img
                alt="usdtoken"
                src={usdIcon}
                width="40"
                height="40"
                className="align-right mx-3 img-fluid"
                />
        USD in DAPP / USD Liquidity: <strong>{parseFloat(token2).toFixed(2)}</strong> tokens</h5>
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
        USD in APPL / USD Liquidity: <strong>{parseFloat(appleBalance).toFixed(2)}</strong></h5>
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
          <Route exact path="/" element={<Swap />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
        

      </HashRouter>
    </Container>
  )
}

export default App;
