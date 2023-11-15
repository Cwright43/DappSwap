/*

import { createSlice } from '@reduxjs/toolkit'

export const aggregator = createSlice({
  name: 'aggregator',
  initialState: {
    contract: null,
    shares: 0,
    swaps: [],
    depositing: {
      isDepositing: false,
      isSucccess: false,
      transactionHash: null
    },
    withdrawing: {
      isWithdrawing: false,
      isSucccess: false,
      transactionHash: null
    },
    swapping: {
      isSwapping: false,
      isSucccess: false,
      transactionHash: null
    }
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload
    },
    poolDAILoaded: (state, action) => {
      state.poolDAI = action.payload
    },
    poolWETHLoaded: (state, action) => {
      state.poolWETH = action.payload
    },
    poolDAI1Loaded: (state, action) => {
      state.poolDAI1 = action.payload
    },
    poolWETH1Loaded: (state, action) => {
      state.poolWETH1 = action.payload
    },
    swapsLoaded: (state, action) => {
      state.swaps = action.payload
    },
    swapRequest: (state, action) => {
      state.swapping.isSwapping = true
      state.swapping.isSuccess = false
      state.swapping.transactionHash = null
    },
    swapSuccess: (state, action) => {
      state.swapping.isSwapping = false
      state.swapping.isSuccess = true
      state.swapping.transactionHash = action.payload
    },
    swapFail: (state, action) => {
      state.swapping.isSwapping = false
      state.swapping.isSuccess = false
      state.swapping.transactionHash = null
    }
  }
})

export const {
  setContract,
  poolDAILoaded,
  poolWETHLoaded,
  poolDAI1Loaded,
  poolWETH1Loaded,
  swapsLoaded,
  swapRequest,
  swapSuccess,
  swapFail
} = aggregator.actions;

export default aggregator.reducer;

*/