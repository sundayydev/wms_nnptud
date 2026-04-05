import { Card, Input, Button, Space, Select, message } from 'antd';
import { SearchOutlined, PlusOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import API_URL from '../../../services/api';

export default function InventoryFilter({ warehouses, products, onSearch, onOpenModal }) {
  const [warehouseId, setWarehouseId] = useState(null);
  const [productId, setProductId] = useState(null);

  const handleClear = () => { 
    setWarehouseId(null);
    setProductId(null);
    onSearch('', '');
  };

  const handleExport = () => {
    if (!warehouseId) {
      message.warning('Vui lòng chọn 1 Kho Hàng cụ thể trong ô tìm kiếm để tải dữ liệu Excel!');
      return;
    }
    // Gửi request tải file
    window.open(`${API_URL}/upload/export/${warehouseId}`, '_blank');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        {/* Vùng Lọc */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
          <Select
             showSearch
             allowClear
             placeholder="Lọc theo Kho Hàng"
             className="w-full sm:w-56 shadow-sm rounded-lg"
             size="large"
             value={warehouseId}
             onChange={(val) => setWarehouseId(val)}
             options={warehouses.map(w => ({ value: w._id, label: w.name }))}
             filterOption={(input, option) =>
               (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
             }
          />
          <Select
             showSearch
             allowClear
             placeholder="Lọc theo Sản phẩm (nhập tên/SKU)"
             className="w-full sm:w-64 shadow-sm rounded-lg"
             size="large"
             value={productId}
             onChange={(val) => setProductId(val)}
             options={products.map(p => ({ value: p._id, label: `${p.sku} - ${p.name}` }))}
             filterOption={(input, option) =>
               (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
             }
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              size="large" 
              className="rounded-lg font-medium px-5 w-full sm:w-auto"
              onClick={() => onSearch(warehouseId, productId)}
            >
              Tìm kiếm
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              size="large" 
              className="rounded-lg text-gray-500 hover:text-gray-700 w-full sm:w-auto"
              onClick={handleClear}
              disabled={!warehouseId && !productId}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Vùng Nút Bấm Thêm Mới */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-4 xl:pt-0 border-gray-100">
          <Button 
            size="large" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            className="rounded-lg font-semibold text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm flex-1 xl:flex-none"
          >
            Xuất Excel Tồn Kho
          </Button>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            onClick={onOpenModal}
            className="rounded-lg font-semibold bg-green-600 hover:bg-green-500 shadow-md shadow-green-500/20 flex-1 xl:flex-none"
          >
            Cập Nhật Thủ Công
          </Button>
        </div>

      </div>
    </div>
  );
}

