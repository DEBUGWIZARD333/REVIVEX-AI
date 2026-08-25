import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin Routes (Example) */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<div className="text-center mt-20 text-2xl font-bold text-slate-500">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
