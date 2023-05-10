import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  bitcoinValue: undefined,
  status: 'idle',
  error: null,
};

export const externalDataSlice = createSlice({
  name: 'externalData',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBitcoinValue.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchBitcoinValue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.bitcoinValue = action.payload;
      })
      .addCase(fetchBitcoinValue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  },
});


export default externalDataSlice.reducer;

export const fetchBitcoinValue = createAsyncThunk('externalData/fetchBitcoinValue', async () => {
  let bitcoinValue = undefined;
  try {
    await fetch('https://api.coindesk.com/v1/bpi/currentprice.json', {
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.json())
      .then((message) => (bitcoinValue = Number(message.bpi.USD.rate.replace(/[^0-9.-]+/g, ''))));
  } catch (error) {
    console.error(error);
  }
  return bitcoinValue;
});
