// 所有页面组件的统一导出入口
import auth from './auth';
import dashboard from './dashboard';
import exam from './exam';
import questionBank from './question-bank';
import studentManagement from './student-management';
import systemSettings from './system-settings';
import manualReview from './manual-review';
import communication from './communication';
import traceMock from './trace-mock';
import NotFound from './NotFound';
import FeatureUnderDevelopment from './FeatureUnderDevelopment';

export default {
  auth,
  dashboard,
  exam,
  questionBank,
  studentManagement,
  systemSettings,
  manualReview,
  communication,
  traceMock,
  NotFound,
  FeatureUnderDevelopment
};
