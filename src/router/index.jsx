import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../layout";
// import LandingLayout from "../layout/LandingLayout"; // 暂时禁用 landing 页面
import pages from "../pages";
import { ProtectedRoute, LoginPage } from "./ProtectedRoutes.jsx";
// import { LandingPage, LoginPage as LandingLoginPage } from "../pages/landing"; // 暂时禁用

// 解构获取各个页面组件
const { Home, CreateExam, UploadAnswerSheet, ScoreProcess, DataAnalysis, EssayGrading, QuestionAnalysis } = pages.dashboard;
const { UserList, ClassManagement } = pages.studentManagement;
const { NotFound, FeatureUnderDevelopment } = pages;
const { MessageDemo, Changelog } = pages.systemSettings;
const { Forum, ReleaseNotes } = pages.communication;
const {
  ExamPaperDesign,
  ChinesePaperDesign,
  MathPaperDesign,
  EnglishPaperDesign,
  ExamPaperPreview,
} = pages.exam;
const { ManualReviewPage } = pages.manualReview;
const { TracePage } = pages.trace;

// 创建路由配置
const router = createBrowserRouter([
  // 落地页路由（暂时禁用，等待用普通 CSS 重写后再启用）
  // {
  //   path: "/landing",
  //   element: <LandingLayout />,
  //   children: [
  //     {
  //       index: true,
  //       element: <LandingPage />,
  //     },
  //   ],
  // },
  // 登录页路由 - 使用原来的登录页
  {
    path: "/login",
    element: <LoginPage />,
  },
  // landing 路由重定向到 login
  {
    path: "/landing",
    element: <Navigate to="/login" replace />,
  },
  // 阅卷系统路由（需要登录）
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
      { path: "essay-grading", element: <EssayGrading /> },
      { path: "question-analysis", element: <QuestionAnalysis /> },
      { path: "manual-review", element: <ManualReviewPage /> },
      { path: "class-management", element: <ClassManagement /> },
      { path: "forum", element: <Forum /> },
      { path: "release-notes", element: <ReleaseNotes /> },
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "message-demo",
        element: <MessageDemo />,
      },
      {
        path: "changelog",
        element: <Changelog />,
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
      {
        path: "trace",
        element: <TracePage />,
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
