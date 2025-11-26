import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import WomanDashboard from './WomanDashboard.jsx';
import EmployerDashboard from './EmployerDashboard.jsx';

function DashboardPage() {
  const { isEmployer } = useAuth();

  // Show the correct dashboard based on the user's role
  return isEmployer ? <EmployerDashboard /> : <WomanDashboard />;
}

export default DashboardPage;