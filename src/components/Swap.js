import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import Alert from './Alert'

import {
  swap,
  loadNetwork,
  loadTokens,
  loadBalances,
  loadDappDappUSD,
  loadAppleUSD,
  loadDAppApple,
  loadDappAppleUSD,
  loadDappDappApple,
} from '../store/interactions'

const Swap = ({ dappAccountBalance, 
                usdAccountBalance, 
                appleAccountBalance } ) => {

    const dispatch = useDispatch()

  // Declare Input/Output Token Features
    const [inputToken, setInputToken] = useState(null)
    const [outputToken, setOutputToken] = useState(null)
    const [inputAmount, setInputAmount] = useState(0)
    const [outputAmount, setOutputAmount] = useState(0)
    const [price, setPrice] = useState(0)
    const [protocol, setProtocol] = useState(0)
    const [showAlert, setShowAlert] = useState(false)
    const [exchangeRate, setExchangeRate] = useState(0)

  // Loading Contract Addresses
    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)
    const chainId = useSelector(state => state.provider.chainId)
    const tokens = useSelector(state => state.tokens.contracts)
    // const symbols = useSelector(state => state.tokens.symbols)
    // const balances = useSelector(state => state.tokens.balances)

  // Declare AMM Variable - Active Contract Address
    const amm = useSelector(state => state.amm.contract)
    const aggregator = useSelector(state => state.amm.aggregator)
    const isSwapping = useSelector(state => state.amm.swapping.isSwapping)
    const isSuccess = useSelector(state => state.amm.swapping.isSuccess)
    const transactionHash = useSelector(state => state.amm.swapping.transactionHash)

  // Load Shares and Active Token Volumes
    // const shares = useSelector(state => state.amm.shares)
    const token1 = useSelector(state => state.amm.token1)
    const token2 = useSelector(state => state.amm.token2)

  const inputHandler = async (e) => {

        if (e.target.value == 0) {
          setPrice(0)
          setOutputAmount(0)
          setExchangeRate(0)
          return
        }

        if (!inputToken || !outputToken) {
          window.alert('Please select token')
          return
        }

        if (inputToken === outputToken) {
          window.alert('Invalid token pair')
          return
        }

      await loadBalances(amm, tokens, account, dispatch)

          if (protocol === 1) {
          setInputAmount(e.target.value)
          const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
          const result = await amm.calculateToken1Swap(_token1Amount)
          const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')
          setOutputAmount(_token2Amount.toString())
          setExchangeRate((_token2Amount/_token1Amount) * 10e17)
        } else if (protocol === 2) {
          setInputAmount(e.target.value)
          const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
          const result = await amm.calculateToken2Swap(_token2Amount)
          const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')
          setOutputAmount(_token1Amount.toString())
          setExchangeRate((_token1Amount/_token2Amount) * 10e17)
      }
      
  }

  const swapHandler = async (e) => {
        e.preventDefault()
        setShowAlert(false)

        if (inputToken === outputToken) {
          window.alert('Invalid Token Pair')
          return
        }

        const _inputAmount = ethers.utils.parseUnits(inputAmount, 'ether')
        await loadTokens(provider, chainId, dispatch);
    
    // Enact Swap Function Based Upon Protocol Orientation
        
            if (protocol === 1) {
            await swap(provider, amm, tokens[0], inputToken, outputToken, _inputAmount, dispatch)
          } else if (protocol === 2) {
            await swap(provider, amm, tokens[1], inputToken, outputToken, _inputAmount, dispatch)
          }

        await loadBalances(amm, tokens, account, dispatch)
        await getPrice()

        setShowAlert(true)
  }

  const getPrice = async () => {

      // Manage For Identical Input & Output Tokens
        if (inputToken === outputToken) {
          setPrice(0)
          return
        }

        if (inputToken === outputToken) {
          window.alert('Invalid token pair')
          return
        }

      // Declare Protocol From Token Pair Orientation
        if ((inputToken === 'DAPP' && outputToken === 'USD') ||
            (inputToken === 'APPL' && outputToken === 'USD') ||
            (inputToken === 'DAPP' && outputToken === 'APPL'))
              {
               setProtocol(1)
              } else {
               setProtocol(2)
              }

      // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
        const chainId = await loadNetwork(provider, dispatch)

      // Loading Active Token Pair & Liquidity Pool Addresses
        if ((inputToken === 'DAPP' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'DAPP')) {
            await loadTokens(provider, chainId, dispatch);
            await loadDappDappUSD(provider, chainId, dispatch);
        } else if ((inputToken === 'APPL' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'APPL')) {
            await loadAppleUSD(provider, chainId, dispatch);
            await loadDappAppleUSD(provider, chainId, dispatch);
        } else if ((inputToken === 'DAPP' && outputToken === 'APPL') || (inputToken === 'APPL' && outputToken === 'DAPP')) {
            await loadDAppApple(provider, chainId, dispatch);
            await loadDappDappApple(provider, chainId, dispatch);
        } 

          await loadBalances(amm, tokens, account, dispatch);

        if (protocol === 1) {
           setPrice((token2 / token1))
         } else if (protocol === 2) {
           setPrice((token1 / token2))
         }
  }
    
    useEffect(() => {
      if(inputToken && outputToken) {
        getPrice();
      }
    }, [inputToken, outputToken]);

  return (
    
    <div>
      <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
        {account ? (
          <Form onSubmit={swapHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
            <Row className='my-3'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Input:</strong></Form.Label>
                <Form.Text muted>
                  Balance: {
                  inputToken === 'DAPP' ? (
                      parseFloat(dappAccountBalance).toFixed(2)
                    ) : inputToken === 'USD' ? (
                      parseFloat(usdAccountBalance).toFixed(2)
                    ) : inputToken === 'APPL' ? (
                      parseFloat(appleAccountBalance).toFixed(2)
                    ) : 0
                  }
                </Form.Text>
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  min="0.0"
                  step="any"
                  onChange={(e) => inputHandler(e)}
                  disabled={!inputToken}
                />
                <DropdownButton
                  variant="outline-secondary"
                  title={inputToken ? inputToken : "Select Token"}
                >
                  <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >DAPP</Dropdown.Item>
                  <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >USD</Dropdown.Item>
                  <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)} >APPL</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            <Row className='my-4'>
              <div className='d-flex justify-content-between'>
                <Form.Label><strong>Output:</strong></Form.Label>
                <Form.Text muted>
                Balance: {
                  outputToken === 'DAPP' ? (
                      parseFloat(dappAccountBalance).toFixed(2)
                    ) : outputToken === 'USD' ? (
                      parseFloat(usdAccountBalance).toFixed(2)
                    ) : outputToken === 'APPL' ? (
                      parseFloat(appleAccountBalance).toFixed(2)
                    ) : 0
                  }
                </Form.Text>
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  value={outputAmount === 0 ? "" : outputAmount }
                  disabled
                />
                <DropdownButton
                  variant="outline-secondary"
                  title={outputToken ? outputToken : "Select Token"}
                >
                  <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>DAPP</Dropdown.Item>
                  <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>USD</Dropdown.Item>
                  <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>APPL</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Row>
            <Row className='my-3'>
              {isSwapping ? (
                <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
              ): (
                <Button type='submit'>Swap</Button>
              )}
              <Form.Text muted>
               <p>Exchange Rate: {parseFloat(exchangeRate).toFixed(4)}</p>
              </Form.Text>
            </Row>
          </Form>
        ) : (
          <p
            className='d-flex justify-content-center align-items-center'
            style={{ height: '300px' }}
          >
            Please connect wallet.
          </p>
        )}
      </Card>
      {isSwapping ? (
        <Alert
          message={'Swap Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Swap Successful'}
          transactionHash={transactionHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Swap Failed'}
          transactionHash={null}
          variant={'danger'}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Swap;
