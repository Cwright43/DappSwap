import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';
import { NumericFormat } from 'react-number-format';

import Alert from './Alert'

import {
  removeLiquidity,
  loadBalances
} from '../store/interactions'

const Withdraw = () => {
  const [amount, setAmount] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const shares = useSelector(state => state.amm.shares)
  const token1 = useSelector(state => state.amm.token1)
  const token2 = useSelector(state => state.amm.token2)

  const tokens = useSelector(state => state.tokens.contracts)
  const balances = useSelector(state => state.tokens.balances)

  const amm = useSelector(state => state.amm.contract)
  const isWithdrawing = useSelector(state => state.amm.withdrawing.isWithdrawing)
  const isSuccess = useSelector(state => state.amm.withdrawing.isSuccess)
  const transactionHash = useSelector(state => state.amm.withdrawing.transactionHash)

  const dispatch = useDispatch()

  const withdrawHandler = async (e) => {
    e.preventDefault()

    setShowAlert(false)

    const _shares = ethers.utils.parseUnits(amount.toString(), 'ether')

    await removeLiquidity(
      provider,
      amm,
      _shares,
      dispatch
    )

    await loadBalances(amm, tokens, account, dispatch)

    setShowAlert(true)
    setAmount(0)
  }

  return (
    <div>
      <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
        {account ? (
          <Form onSubmit={withdrawHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>

            <Row>
              <Form.Text className='text-end my-2' muted>
                Shares: {parseFloat(shares).toFixed(2)}
              </Form.Text>

              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0"
                  min="0.0"
                  step="any"
                  id="shares"
                  value={amount === 0 ? "" : amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <InputGroup.Text style={{ width: "100px" }} className="justify-content-center">
                  Shares
                </InputGroup.Text>
              </InputGroup>
            </Row>

            <Row className='my-3'>
              {isWithdrawing ? (
                <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
              ) : (
                <Button type="submit">Withdraw</Button>
              )}
            </Row>

            <hr />

            <Row>
              <p><strong>DAPP Balance:</strong> {parseFloat(balances[0]).toFixed(2)}</p>
              <p><strong>USD Balance:</strong> {parseFloat(balances[0]).toFixed(2)}</p>
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

      {isWithdrawing ? (
        <Alert
          message={'Withdraw Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Withdraw Successful'}
          transactionHash={transactionHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Withdraw Failed'}
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

export default Withdraw;
