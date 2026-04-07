export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Xin chào, {user?.username} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Đây là tổng quan tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Đơn hàng của tôi</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Đang xử lý</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Hoàn thành</p>
          <p className="text-3xl font-bold text-green-500 mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
