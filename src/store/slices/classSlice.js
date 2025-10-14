import { createSlice } from "@reduxjs/toolkit";

// 初始状态
const initialState = {
  classList: [], // 班级列表
  selectedClassId: null, // 选中的班级ID
};

// 创建班级信息slice
const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    // 设置班级列表
    setClassList: (state, action) => {
      state.classList = action.payload;
    },
    // 设置选中的班级ID
    setSelectedClassId: (state, action) => {
      state.selectedClassId = action.payload;
    },
    // 清空班级信息
    clearClassInfo: (state) => {
      state.classList = [];
      state.selectedClassId = null;
    },
  },
});

// 导出actions
export const { setClassList, setSelectedClassId, clearClassInfo } =
  classSlice.actions;

// 导出reducer
export default classSlice.reducer;
