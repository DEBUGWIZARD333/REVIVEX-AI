import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import ProductList from '../pages/ProductList';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import MonitoringDashboard from '../pages/MonitoringDashboard';
import RiskMonitoringDashboard from '../pages/RiskMonitoringDashboard';
import DecisionDashboard from '../pages/DecisionDashboard';
import RevenueRecoveryDashboard from '../pages/RevenueRecoveryDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ProductList />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected User & Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<MonitoringDashboard />} />
        <Route path="/risk-dashboard" element={<RiskMonitoringDashboard />} />
        <Route path="/decision-dashboard" element={<DecisionDashboard />} />
        <Route path="/revenue-recovery" element={<RevenueRecoveryDashboard />} />
        <Route path="/user-dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin/monitoring" element={<MonitoringDashboard />} />
        <Route path="/admin/risk-monitoring" element={<RiskMonitoringDashboard />} />
        <Route path="/admin/decision-dashboard" element={<DecisionDashboard />} />
        <Route path="/admin/revenue-recovery" element={<RevenueRecoveryDashboard />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<div className="text-center mt-20 text-2xl font-bold text-slate-500">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
