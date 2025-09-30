import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout";
import pages from "../pages";
import { ProtectedRoute, LoginPage } from "./ProtectedRoutes.jsx";

// 解构获取各个页面组件
const { Home, CreateExam, UploadAnswerSheet, ScoreProcess, DataAnalysis } =
  pages.dashboard;
const { UserList } = pages.studentManagement;
const { NotFound, FeatureUnderDevelopment } = pages;
const { MessageDemo } = pages.systemSettings;
const {
  ExamPaperDesign,
  ChinesePaperDesign,
  MathPaperDesign,
  EnglishPaperDesign,
  ExamPaperPreview,
} = pages.exam;

// 创建路由配置
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: "coming-soon", element: <FeatureUnderDevelopment /> },
      { path: "exams", element: <FeatureUnderDevelopment /> },
      { path: "questions", element: <FeatureUnderDevelopment /> },
      { path: "settings", element: <FeatureUnderDevelopment /> },
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "message-demo",
        element: <MessageDemo />,
      },
      {
        path: "create-exam",
        element: <CreateExam />,
      },
      {
        path: "upload-answer-sheet",
        element: <UploadAnswerSheet />,
      },
      {
        path: "exam-paper-design",
        element: <ExamPaperDesign />,
      },
      {
        path: "exam-paper-design/chinese",
        element: <ChinesePaperDesign />,
      },
      {
        path: "exam-paper-design/math",
        element: <MathPaperDesign />,
      },
      {
        path: "exam-paper-design/english",
        element: <EnglishPaperDesign />,
      },
      {
        path: "score-process",
        element: <ScoreProcess />,
      },
      {
        path: "data-analysis",
        element: <DataAnalysis />,
      },
    ],
  },
  // 试卷预览页面 - 不需要Layout包裹但需要登录保护
  {
    path: "/exam-paper-preview",
    element: (
      <ProtectedRoute>
        <ExamPaperPreview />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
]);

export default router;
