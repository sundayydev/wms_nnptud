import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute - Bảo vệ route dựa theo trạng thái đăng nhập và role
 * @param {string} requiredRole - 'admin' | 'user' | undefined (chỉ cần đăng nhập)
 */
export default function ProtectedRoute({ requiredRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Chưa đăng nhập → về trang login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Có yêu cầu role cụ thể nhưng không khớp → 403
  if (requiredRole && user.role?.name !== requiredRole) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-3xl font-bold text-red-500">Không có quyền truy cập</h1>
        <p className="text-gray-500">
          Trang này yêu cầu quyền <strong>{requiredRole}</strong>.
          Tài khoản của bạn là <strong>{user.role?.name}</strong>.
        </p>
        <a href="/" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Về trang chủ
        </a>
      </div>
    );
  }

  return <Outlet />;
}
