import { createSlice } from '@reduxjs/toolkit';

const previewSlice = createSlice({
  name: 'preview',
  initialState: {
    examData: null,
    answerSheetPages: []
  },
  reducers: {
    setPreviewData: (state, action) => {
      state.examData = action.payload.examData;
      state.answerSheetPages = action.payload.answerSheetPages;
    },
    clearPreviewData: (state) => {
      state.examData = null;
      state.answerSheetPages = [];
    }
  }
});

export const { setPreviewData, clearPreviewData } = previewSlice.actions;

export default previewSlice.reducer;