// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    clearUser: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserData: (state, action) => {
      state.data = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    // Action to clear all application data
    clearAllData: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    }
  },

});

export const { clearUser, setLoading, setUserData, clearAllData } = userSlice.actions;
export default userSlice.reducer;

