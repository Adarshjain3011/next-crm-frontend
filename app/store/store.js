import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';

import enquerySlice from "./slice/enquerySlice";
import salesPersonData from "./slice/salesPersonData";
import quoteSlice from "./slice/quoteSlice";
import membersSlice from "./slice/membersSlice";

// Create a transform that adds timestamp to the state
const expireTransform = createTransform(
  // transform state on its way to being serialized and persisted
  (inboundState, key) => {
    return {
      ...inboundState,
      _persistTimestamp: Date.now(),
    };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // Check if data is older than 1 hour (3600000 milliseconds)
    if (outboundState._persistTimestamp && Date.now() - outboundState._persistTimestamp > 3600000) {
      // Return empty state if data is expired
      return {};
    }
    // Remove the timestamp from the state
    const { _persistTimestamp, ...stateWithoutTimestamp } = outboundState;
    return stateWithoutTimestamp;
  },
  // define which reducers this transform runs on
  { whitelist: ['enquery', 'salesPerson', 'quote', 'members'] }
);

const rootReducer = combineReducers({
  enquery: enquerySlice,
  salesPerson: salesPersonData,
  quote: quoteSlice,
  members: membersSlice
});

const persistConfig = {
  key: 'root',
  storage,
  transforms: [expireTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

