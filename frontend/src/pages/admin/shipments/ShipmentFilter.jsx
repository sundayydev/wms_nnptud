import { Input, Button, Space, Select } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function ShipmentFilter({ onSearch, onOpenModal }) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(null);

  const handleSearch = () => {
    onSearch(keyword, status);
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(null);
    onSearch('', null);
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <Space wrap size="middle" className="flex-1">
          <Input 
            placeholder="Tìm theo mã vận đơn..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="w-full md:w-64 shadow-sm rounded-lg"
            size="large"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Select 
            placeholder="Lọc theo trạng thái"
            className="w-full md:w-48 shadow-sm rounded-lg"
            size="large"
            options={[
              { value: 'Preparing', label: 'Chuẩn bị (Preparing)' },
              { value: 'In Transit', label: 'Đang giao (In Transit)' },
              { value: 'Delivered', label: 'Đã giao (Delivered)' },
              { value: 'Failed', label: 'Thất bại (Failed)' }
            ]}
            allowClear
            value={status}
            onChange={(val) => setStatus(val)}
          />
          <Button type="primary" size="large" ghost icon={<SearchOutlined />} onClick={handleSearch} className="rounded-lg font-medium px-6">
            Lọc KQ
          </Button>
          <Button size="large" icon={<ReloadOutlined />} onClick={handleReset} className="rounded-lg text-gray-500 hover:text-gray-700">
            Mặc định
          </Button>
        </Space>
        
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => onOpenModal()} className="rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 w-full lg:w-auto border-0">
          Tạo Vận Đơn
        </Button>
      </div>
    </div>
  );
}
