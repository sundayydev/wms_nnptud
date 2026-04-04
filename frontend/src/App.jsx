import { Button, DatePicker, Space, Typography } from 'antd';

const { Title } = Typography;

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">

        {/* Sử dụng Tailwind CSS để căn chỉnh và màu sắc */}
        <Title level={2} className="text-blue-600 mb-6">
          Vite + React
        </Title>

        <p className="text-gray-500 mb-8 font-medium">
          Đã cài đặt thành công Ant Design & Tailwind CSS!
        </p>

        {/* Sử dụng Component của Ant Design */}
        <Space direction="vertical" size="large" className="w-full">
          <DatePicker className="w-full" />
          <Button type="primary" size="large" block>
            Khám phá ngay
          </Button>
          <Button type="default" size="large" block>
            Hủy bỏ
          </Button>
        </Space>

      </div>
    </div>
  );
}

export default App;