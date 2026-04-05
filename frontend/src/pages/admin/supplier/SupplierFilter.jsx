import { Input, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function SupplierFilter({ onSearch, onOpenModal }) {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    onSearch(keyword);
  };

  const handleReset = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <Space wrap size="middle" className="flex-1">
          <Input 
            placeholder="Tìm theo tên ncc, sđt, email..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="w-full md:w-80 shadow-sm rounded-lg"
            size="large"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" size="large" ghost icon={<SearchOutlined />} onClick={handleSearch} className="rounded-lg font-medium px-6">
            Tìm kiếm
          </Button>
          <Button size="large" icon={<ReloadOutlined />} onClick={handleReset} className="rounded-lg text-gray-500 hover:text-gray-700">
            Mặc định
          </Button>
        </Space>
        
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => onOpenModal()} className="rounded-lg font-semibold bg-green-600 hover:bg-green-500 shadow-md shadow-green-500/20 w-full lg:w-auto border-0">
          Thêm Nhà Cung Cấp
        </Button>
      </div>
    </div>
  );
}
