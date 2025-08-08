import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import {
  loadUserFromStorage,
  LoggingData,
  login,
  logout,
  refreshToken,
  setLoading,
} from './auth/authSlice';
import { useCallback } from 'react';

// Custom hook to use dispatch and selector methods
export const useStore = () => {
  const dispatch = useDispatch<AppDispatch>();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  // Auth state selectors
  const isLogged = useAppSelector((state) => state.auth.isLogged);
  const loggingData = useAppSelector((state) => state.auth.loggingData);
  const loading = useAppSelector((state) => state.auth.loading);

  // Auth dispatch methods
  const loginUser = useCallback(
    (userData: {
      user: LoggingData;
      accessToken: string;
      refreshToken: string;
    }) => dispatch(login(userData)),
    [dispatch]
  );
  const logoutUser = useCallback(() => dispatch(logout()), [dispatch]);

  const refreshUserToken = useCallback(
    (userData: {
      user: LoggingData;
      accessToken: string;
      refreshToken?: string;
    }) => dispatch(refreshToken(userData)),
    [dispatch]
  );

  const loadUser = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(loadUserFromStorage());
    dispatch(setLoading(false));
  }, [dispatch]);

  return {
    isLogged,
    loggingData,
    loading,
    loginUser,
    logoutUser,
    loadUser,
    refreshUserToken,
  };
};
