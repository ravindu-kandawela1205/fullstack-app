import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import ProductsTable from '@/pages/ProductsTable';
import LocalUsersTable from '@/pages/LocalUsersTable';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import { ROUTES } from '@/constants/routes.constant';
import { useTheme } from '@/store/themeStore';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

function App() {
  const { theme } = useTheme();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
        <Route path={ROUTES.REGISTER} element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.product_list} element={<ProductsTable />} />
                <Route path={ROUTES.LOCAL_USERS} element={<LocalUsersTable />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    <Toaster richColors position="top-right" />
    </>
  );
}

export default App;

