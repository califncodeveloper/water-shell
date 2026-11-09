/**
 * AquaPure Admin — App Entry with Auth Protection & Routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './services/authContext';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './features/dashboard/Dashboard';
import { ProductsPage } from './features/products/ProductsPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { DealersPage, AccountsPage } from './features/dealers/DealersPage';
import { ServicePage } from './features/service/ServicePage';
import { ReportsPage } from './features/reports/ReportsPage';
import { DeliveryZonesPage } from './features/delivery/DeliveryZonesPage';
import { LoginPage } from './features/auth/LoginPage';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import './features/auth/LoginPage.css';
import './index.css';

function ProtectedRoutes() {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-background, #F8FAFC)',
          color: 'var(--color-text-secondary)',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Authenticating Water Shell Administrator...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="delivery-zones" element={<DeliveryZonesPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="dealers" element={<DealersPage />} />
        <Route path="service" element={<ServicePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <SmoothScrollProvider>
          <ProtectedRoutes />
        </SmoothScrollProvider>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
