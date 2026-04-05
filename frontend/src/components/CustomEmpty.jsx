import { Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

export default function CustomEmpty({ title = 'Chưa có dữ liệu', description = 'Không tìm thấy thông tin nào trong hệ thống.' }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center">
      <div className="bg-gray-50/80 p-6 rounded-full mb-4 border border-gray-100 shadow-sm">
        <InboxOutlined className="text-6xl text-gray-300" />
      </div>
      <Typography.Title level={4} className="!mb-1 !text-gray-700 !font-semibold">
        {title}
      </Typography.Title>
      <Typography.Text className="text-gray-500">
        {description}
      </Typography.Text>
    </div>
  );
}
