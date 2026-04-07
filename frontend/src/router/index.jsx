import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';

// Guards
import ProtectedRoute from '../components/ProtectedRoute';

// Auth Pages
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import AdminCategory from '../pages/admin/category';
import AdminCustomer from '../pages/admin/customer';
import AdminProduct from '../pages/admin/product';
import AdminWarehouse from '../pages/admin/warehouse';
import AdminSupplier from '../pages/admin/supplier';
import AdminPurchaseOrder from '../pages/admin/purchaseOrder';
import AdminSalesOrder from '../pages/admin/salesOrder';
import AdminInventory from '../pages/admin/inventory';
import AdminUser from '../pages/admin/user';
import AuditLog from '../pages/admin/AuditLog';
import AdminShipment from '../pages/admin/shipments';

// User Pages (nhân viên kho)
import UserDashboard from '../pages/user/Dashboard';
import UserProducts from '../pages/user/Products';
import UserInventory from '../pages/user/Inventory';
import UserPurchaseOrders from '../pages/user/PurchaseOrders';
import UserSalesOrders from '../pages/user/SalesOrders';
import UserShipments from '../pages/user/shipments';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Trang chủ → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProduct />} />
            <Route path="categories" element={<AdminCategory />} />
            <Route path="customers" element={<AdminCustomer />} />
            <Route path="warehouses" element={<AdminWarehouse />} />
            <Route path="suppliers" element={<AdminSupplier />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrder />} />
            <Route path="sales-orders" element={<AdminSalesOrder />} />
            <Route path="inventories" element={<AdminInventory />} />
            <Route path="users" element={<AdminUser />} />
            <Route path="auditlog" element={<AuditLog />} />
            <Route path="shipments" element={<AdminShipment />} />
          </Route>
        </Route>

        {/* User Routes - nhân viên kho */}
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="products" element={<UserProducts />} />
            <Route path="inventories" element={<UserInventory />} />
            <Route path="purchase-orders" element={<UserPurchaseOrders />} />
            <Route path="sales-orders" element={<UserSalesOrders />} />
            <Route path="shipments" element={<UserShipments />} />
          </Route>
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

