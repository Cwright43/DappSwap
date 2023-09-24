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
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadAMM,
  loadBalances,
  loadAppleUSD,
  loadDAppApple,
  loadToken3and4,
  loadToken5and6

} from '../store/interactions'

const Swap = () => {
  const [inputToken, setInputToken] = useState(null)
  const [outputToken, setOutputToken] = useState(null)
  const [inputAmount, setInputAmount] = useState(0)
  const [outputAmount, setOutputAmount] = useState(0)

  const [price, setPrice] = useState(0)

  const [showAlert, setShowAlert] = useState(false)

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const balances = useSelector(state => state.tokens.balances)

  const amm = useSelector(state => state.amm.contract)
  const isSwapping = useSelector(state => state.amm.swapping.isSwapping)
  const isSuccess = useSelector(state => state.amm.swapping.isSuccess)
  const transactionHash = useSelector(state => state.amm.swapping.transactionHash)

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Initiate provider
    const provider = await loadProvider(dispatch)


  }

  const inputHandler = async (e) => {
    if (!inputToken || !outputToken) {
      window.alert('Please select token')
      return
    }

    if (inputToken === outputToken) {
      window.alert('Invalid token pair')
      return
    }


    /*
    // Cycle DAPP / USD
    if ((inputToken === 'DAPP' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'DAPP')) {
      setInputAmount(e.target.value)
      // SET CONTRACT DAPP / USD

        if (inputToken === 'DAPP') {
        const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
        const result = await amm.calculateToken1Swap(_token1Amount)
        const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')
        setOutputAmount(_token2Amount.toString())
            } else {
              const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
              const result = await amm.calculateToken2Swap(_token2Amount)
              const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')

              setOutputAmount(_token1Amount.toString())
            }
    // Cycle APPL / USD
    } else if ((inputToken === 'APPL' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'APPL')) {
      setInputAmount(e.target.value)
      // Set contract APPL / USD

        if (inputToken === 'APPL') {
        const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
        const result = await amm.calculateToken1Swap(_token1Amount)
        const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')
        setOutputAmount(_token2Amount.toString())
            } else {
              const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
              const result = await amm.calculateToken2Swap(_token2Amount)
              const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')

              setOutputAmount(_token1Amount.toString())
            }
    // Cycle DAPP / APPL
    } else {
      setInputAmount(e.target.value)
      // Set Contract DAPP / APPL

      if (inputToken === 'DAPP') {
        const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
        const result = await amm.calculateToken1Swap(_token1Amount)
        const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')
        setOutputAmount(_token2Amount.toString())
            } else {
              const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
              const result = await amm.calculateToken2Swap(_token2Amount)
              const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')

              setOutputAmount(_token1Amount.toString())
    }
  }
    */

  if (inputToken === 'DAPP') {
    setInputAmount(e.target.value)

    const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
    const result = await amm.calculateToken1Swap(_token1Amount)
    const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')

    setOutputAmount(_token2Amount.toString())

  } else {
    setInputAmount(e.target.value)

    const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
    const result = await amm.calculateToken2Swap(_token2Amount)
    const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')

    setOutputAmount(_token1Amount.toString())
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

    // Swap token depending upon which one we're doing...
    if (inputToken === "DAPP") {
      await swap(provider, amm, tokens[0], inputToken, _inputAmount, dispatch)
    } else {
      await swap(provider, amm, tokens[1], inputToken, _inputAmount, dispatch)
    }

    await loadBalances(amm, tokens, account, dispatch)
    await getPrice()

    setShowAlert(true)

  }

  const getPrice = async () => {
    if (inputToken === outputToken) {
      setPrice(0)
      return
    }
  
    /*

    if (inputToken === 'DAPP') {
      setPrice(await amm.token2Balance() / await amm.token1Balance())
    } else {
      setPrice(await amm.token1Balance() / await amm.token2Balance())
    }

    */
  
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)

    if ((inputToken === 'DAPP' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'DAPP')) {
          await loadTokens(provider, chainId, dispatch)
          console.log("Tokens loaded")
          if(inputToken === 'DAPP') {
             console.log("DAPP/USD - DAPP")
             setPrice(await amm.token2Balance() / await amm.token1Balance())
          } else {
             console.log("DAPP/USD - USD")
             setPrice(await amm.token1Balance() / await amm.token2Balance())
          }
    } else if ((inputToken === 'APPL' && outputToken === 'USD') || (inputToken === 'USD' && outputToken === 'APPL')) {
          await loadAppleUSD(provider, chainId, dispatch)
          console.log("Super tokens loaded")
          if(inputToken === 'APPL') {
            console.log("APPL/USD - APPL")
            setPrice(await amm.token2Balance() / await amm.token1Balance())
          } else {
            console.log("APPL/USD - USD")
            setPrice(await amm.token2Balance() / await amm.token1Balance())
          }
    } else if ((inputToken === 'DAPP' && outputToken === 'APPL') || (inputToken === 'APPL' && outputToken === 'DAPP')) {
          await loadDAppApple(provider, chainId, dispatch)
          console.log("Ultra tokens loaded")
          if(inputToken === 'DAPP') {
            console.log("DAPP/APPL - DAPP")
            setPrice(await amm.token2Balance() / await amm.token1Balance())
          } else {
            console.log("DAPP/APPL - APPL")
            setPrice(await amm.token2Balance() / await amm.token1Balance())
          }
    }

}
    
  useEffect(() => {
    if(inputToken && outputToken) {
      getPrice()
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
                    inputToken === symbols[0] ? (
                      parseFloat(balances[0]).toFixed(2)
                    ) : inputToken === symbols[1] ? (
                      parseFloat(balances[1]).toFixed(2)
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
                  onChange={(e) => inputHandler(e) }
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
                    outputToken === symbols[0] ? (
                      parseFloat(balances[0]).toFixed(2)
                    ) : outputToken === symbols[1] ? (
                      parseFloat(balances[1]).toFixed(2)
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
                Exchange Rate: {price}
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
