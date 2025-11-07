import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import ProductsTable from '@/pages/ProductsTable';
import LocalUsersTable from '@/pages/LocalUsersTable';
import { ROUTES } from '@/constants/routes.constant';

function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.USERS_LIST} element={<ProductsTable />} />
          <Route path={ROUTES.LOCAL_USERS} element={<LocalUsersTable />} />

        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

export default App;

