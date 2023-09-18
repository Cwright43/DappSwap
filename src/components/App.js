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

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadAMM
} from '../store/interactions'

function App() {

  const [amm, setAMM] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(0)

  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);

  const token1 = useSelector(state => state.amm.token1)
  const token2 = useSelector(state => state.amm.token2)
  const poolDAI = useSelector(state => state.amm.poolDAI)
  const poolWETH = useSelector(state => state.amm.poolWETH)

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
    <>
      <Button
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
      >
        DappSwap Liquidity 
      </Button>
      <div style={{ minHeight: '100px' }}>
        <Collapse in={open} dimension="width">
          <div id="example-collapse-text">
            <Card body style={{ width: '400px' }}>
            <h6>DAPP Liquidity: {parseFloat(token1).toFixed(2)}</h6>
            <h6>USD Liquidity: {parseFloat(token2).toFixed(2)}</h6>
            </Card>
          </div>
        </Collapse>
      </div>
    </>
        <hr />

        <h5 className='my-4 text-left'>Total DAPP in Liquidity: <strong>{parseFloat(token1).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>Total USD in Liquidity: <strong>{parseFloat(token2).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>Total DAI in Uniswap: <strong>{parseFloat(poolDAI).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>Total WETH in Uniswap: <strong>{parseFloat(poolWETH).toFixed(2)}</strong> tokens</h5>
        <h5 className='my-4 text-left'>DAI/WETH Rate: <strong>{parseFloat(poolDAI / poolWETH).toFixed(2)}</strong> tokens</h5>

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
