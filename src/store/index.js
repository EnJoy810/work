import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用localStorage
import userReducer from './slices/userSlice';
import previewReducer from './slices/previewSlice';
import classReducer from './slices/classSlice';

// 用户信息持久化配置
const userPersistConfig = {
  key: 'user',
  storage,
};

// 班级信息持久化配置
const classPersistConfig = {
  key: 'class',
  storage,
};

// 创建持久化的reducer
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedClassReducer = persistReducer(classPersistConfig, classReducer);

// 配置Redux store
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    preview: previewReducer,
    class: persistedClassReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // 禁用serializableCheck，允许非序列化数据
});

// 创建persistor
export const persistor = persistStore(store);