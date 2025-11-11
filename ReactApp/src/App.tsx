import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import ProductsTable from '@/pages/ProductsTable';
import LocalUsersTable from '@/pages/LocalUsersTable';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { ROUTES } from '@/constants/routes.constant';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path="*" element={
          <AdminLayout>
            <Routes>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.USERS_LIST} element={<ProductsTable />} />
              <Route path={ROUTES.LOCAL_USERS} element={<LocalUsersTable />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

