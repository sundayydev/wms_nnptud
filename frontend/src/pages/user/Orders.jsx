export default function UserOrders() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Đơn Hàng Của Tôi</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
        <div className="text-5xl mb-3">📦</div>
        <p className="text-lg font-medium">Chưa có đơn hàng nào</p>
        <p className="text-sm mt-1">Các đơn hàng của bạn sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
}
