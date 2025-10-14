import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用localStorage
import userReducer from './slices/userSlice';
import previewReducer from './slices/previewSlice';
import classReducer from './slices/classSlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage,
  // 可以配置需要持久化的reducer
  // whitelist: ['user'] // 只有user reducer会被持久化
};

// 创建持久化的reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// 配置Redux store
export const store = configureStore({
  reducer: {
    user: persistedReducer,
    preview: previewReducer,
    class: classReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // 禁用serializableCheck，允许非序列化数据
});

// 创建persistor
export const persistor = persistStore(store);