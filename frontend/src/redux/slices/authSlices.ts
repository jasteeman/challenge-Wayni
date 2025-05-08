import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../interfaces/IUser';
 
interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  loadingAuth: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loadingAuth:false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action: PayloadAction<IUser>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loadingAuth = false;
    },
    userLoggedOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loadingAuth = false;
    },
    setLoadingAuth: (state, action: PayloadAction<boolean>) => {
        state.loadingAuth = action.payload;
    }
  },
});

export const { userLoggedIn, userLoggedOut,setLoadingAuth } = authSlice.actions;

export default authSlice.reducer;