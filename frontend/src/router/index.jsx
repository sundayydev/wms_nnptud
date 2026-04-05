import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Client Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import ClientProduct from '../pages/main/product';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import ManageCategories from '../pages/admin/ManageCategories';
import AdminProduct from '../pages/admin/product';
import AdminWarehouse from '../pages/admin/warehouse';
import AdminSupplier from '../pages/admin/supplier';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ClientProduct />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="warehouses" element={<AdminWarehouse />} />
          <Route path="suppliers" element={<AdminSupplier />} />
          <Route path="users" element={<div className="p-4 text-xl">Phân Quyền Hệ Thống</div>} />
        </Route>

        <Route path="*" element={
          <div className="h-screen flex items-center justify-center text-4xl font-black text-gray-300">
            404 | NOT FOUND
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}
