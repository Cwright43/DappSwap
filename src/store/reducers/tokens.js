import { createSlice } from '@reduxjs/toolkit'

export const tokens = createSlice({
  name: 'tokens',
  initialState: {
    contracts: [],
    symbols: [],
    balances: [0, 0]
  },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload
    },
    setSymbols: (state, action) => {
      state.symbols = action.payload
    },
    balancesLoaded: (state, action) => {
      state.balances = action.payload
    },
    setContracts1: (state, action) => {
      state.contracts = action.payload
    },
    setSymbols1: (state, action) => {
      state.symbols = action.payload
    },
    balancesLoaded1: (state, action) => {
      state.balances = action.payload
    },
    setContracts2: (state, action) => {
      state.contracts = action.payload
    },
    setSymbols2: (state, action) => {
      state.symbols = action.payload
    },
    balancesLoaded2: (state, action) => {
      state.balances = action.payload
    }
  }
})

export const {  
      setContracts, 
      setSymbols, 
      balancesLoaded,
      setContracts1, 
      setSymbols1, 
      balancesLoaded1,
      setContracts2, 
      setSymbols2, 
      balancesLoaded2
    } = tokens.actions;

export default tokens.reducer;
