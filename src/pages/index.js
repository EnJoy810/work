// 所有页面组件的统一导出入口
import dashboard from './dashboard';
import exam from './exam';
import questionBank from './question-bank';
import studentManagement from './student-management';
import systemSettings from './system-settings';
import NotFound from './NotFound';
import FeatureUnderDevelopment from './FeatureUnderDevelopment';

export default {
  dashboard,
  exam,
  questionBank,
  studentManagement,
  systemSettings,
  NotFound,
  FeatureUnderDevelopment
};