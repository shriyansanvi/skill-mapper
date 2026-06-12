import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// --- Pages ---
import Homepage from './pages/Homepage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ShowcaseGuide from './pages/ShowcaseGuide.jsx';
import ConnectGuide from './pages/ConnectGuide.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import QuizListPage from './pages/QuizListPage.jsx';
import TakeQuizPage from './pages/TakeQuizPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      // --- Public Routes (Accessible by anyone) ---
      { path: "/", element: <Homepage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/guide/showcase", element: <ShowcaseGuide /> },
      { path: "/guide/connect", element: <ConnectGuide /> },
      
      // We allow viewing details publicly, but actions (apply/join) inside might require login
      { path: "/jobs/:jobId", element: <JobDetailPage /> },
      { path: "/groups/:groupId", element: <GroupDetailPage /> },

      // --- Protected Routes (Login required) ---
      { 
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/quizzes", element: <QuizListPage /> },
          { path: "/quizzes/:quizId", element: <TakeQuizPage /> }
        ]
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;