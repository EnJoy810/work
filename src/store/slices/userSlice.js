import { createSlice } from '@reduxjs/toolkit';

// 初始状态
const initialState = {
  userInfo: null,
  isLoggedIn: false,
  token: null,
};

// 创建用户信息slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 登录成功时设置用户信息
    setUserInfo: (state, action) => {
      state.userInfo = action.payload.userInfo;
      state.isLoggedIn = true;
      state.token = action.payload.token;
    },
    // 登出时清空用户信息
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.isLoggedIn = false;
      state.token = null;
    },
    // 更新用户信息
    updateUserInfo: (state, action) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
  },
});

// 导出actions
export const { setUserInfo, clearUserInfo, updateUserInfo } = userSlice.actions;

// 导出reducer
export default userSlice.reducer;