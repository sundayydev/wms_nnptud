import { Input, Button, Select, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function ProductFilter({ categories = [], onSearch, onOpenModal, onOpenImportModal }) {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const handleSearch = () => {
    onSearch(keyword, categoryId);
  };

  const handleReset = () => {
    setKeyword('');
    setCategoryId(null);
    onSearch('', null);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        {/* Vùng Lọc */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
          <Input 
            placeholder="Tìm theo tên sản phẩm, SKU..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="w-full sm:max-w-xs shadow-sm rounded-lg"
            size="large"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Select 
            placeholder="Chỉ định danh mục lọc"
            className="w-full sm:w-56 shadow-sm rounded-lg"
            size="large"
            options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
            allowClear
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="primary" size="large" ghost icon={<SearchOutlined />} onClick={handleSearch} className="rounded-lg font-medium px-5 w-full sm:w-auto">
              Tìm kiếm
            </Button>
            <Button size="large" icon={<ReloadOutlined />} onClick={handleReset} className="rounded-lg text-gray-500 hover:text-gray-700 w-full sm:w-auto">
              Reset
            </Button>
          </div>
        </div>

        {/* Vùng Nút Bấm Thêm Mới */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100">
          <Button size="large" icon={<InboxOutlined />} onClick={onOpenImportModal} className="rounded-lg font-semibold text-green-700 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 shadow-sm flex-1 xl:flex-none">
            Import Excel
          </Button>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onOpenModal} className="rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 flex-1 xl:flex-none">
            Thêm Sản Phẩm
          </Button>
        </div>

      </div>
    </div>
  );
}
