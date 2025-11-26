import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Homepage from './pages/Homepage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import Layout from './components/Layout.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ExplorePage from './pages/ExplorePage.jsx';

// --- Import New Guide Pages ---
import ShowcaseGuide from './pages/ShowcaseGuide.jsx';
import ConnectGuide from './pages/ConnectGuide.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/jobs/:jobId", element: <JobDetailPage /> },
      { path: "/groups/:groupId", element: <GroupDetailPage /> },
      
      // --- Add New Guide Routes ---
      { path: "/guide/showcase", element: <ShowcaseGuide /> },
      { path: "/guide/connect", element: <ConnectGuide /> },
      { path: "/explore", element: <ExplorePage /> },

      { 
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> }
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