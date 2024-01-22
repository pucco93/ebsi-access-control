import { configureStore } from '@reduxjs/toolkit';
import { accessControlListSlice } from './accessControlListStore';

export const store = configureStore({
  reducer: {
    accessControlList: accessControlListSlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;