import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, DatabaseOutlined } from '@ant-design/icons';
import InventoryFilter from './InventoryFilter';
import InventoryModal from './InventoryModal';
import { inventoryService } from '../../../services/inventoryService';
import { warehouseService } from '../../../services/warehouseService';
import { productService } from '../../../services/productService';
import CustomEmpty from '../../../components/CustomEmpty';
import dayjs from 'dayjs';

export default function AdminInventory() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const [inventoriesRes, warehousesRes, productsRes] = await Promise.all([
        inventoryService.getAll(searchParams),
        warehouseService.getAll(),
        productService.getAll()
      ]);
      const mappedData = inventoriesRes.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
      setWarehouses(warehousesRes);
      setProducts(productsRes);
    } catch (error) {
      if (typeof error === 'string') message.error("Lỗi: " + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await inventoryService.delete(id);
      message.success("Xoá dữ liệu tồn kho thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const columns = [
    { 
      title: 'Kho Hàng', 
      dataIndex: 'warehouse', 
      key: 'warehouse',
      render: (wh) => (
        <span className="font-semibold text-gray-800 bg-blue-50 px-3 py-1 rounded border border-blue-100">
          {wh?.name || 'N/A'}
        </span>
      )
    },
    { 
      title: 'Sản Phẩm', 
      dataIndex: 'product', 
      key: 'product',
      render: (prod) => (
        <div>
          <div className="font-bold text-gray-800">{prod?.name || 'N/A'}</div>
          {prod?.sku && <div className="text-xs text-gray-400">SKU: {prod.sku}</div>}
        </div>
      )
    },
    { 
      title: 'Số Lượng Tồn', 
      dataIndex: 'quantity', 
      key: 'quantity',
      align: 'right',
      render: (val, record) => {
        let colorClass = val === 0 ? "text-red-600 bg-red-50 border-red-200" : val < 10 ? "text-orange-600 bg-orange-50 border-orange-200" : "text-green-700 bg-green-50 border-green-200";
        return (
          <span className={`font-bold px-3 py-1 rounded inline-block text-center min-w-[80px] border ${colorClass}`}>
            {val ? val.toLocaleString('vi-VN') : 0} {record.product?.unit}
          </span>
        );
      }
    },
    { 
      title: 'Cập Nhật Lần Cuối', 
      dataIndex: 'updatedAt', 
      key: 'updatedAt',
      render: (date) => <Typography.Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Typography.Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa số lượng tồn">
            <Button 
                type="text" 
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord({...record, warehouse: record.warehouse?._id, product: record.product?._id}); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá mục tồn kho này?" description="Thao tác này không thể hoàn tác." okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (warehouseId, productId) => {
    const params = new URLSearchParams();
    if(warehouseId) params.append('warehouse', warehouseId);
    if(productId) params.append('product', productId);
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <DatabaseOutlined className="text-blue-600" /> Tồn Kho
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi số lượng hàng hoá trong từng kho hàng.</p>
        </div>
      </div>

      <InventoryFilter 
        warehouses={warehouses} 
        products={products} 
        onSearch={handleSearch} 
        onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} 
      />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Trống" description="Chưa có thông tin tồn kho." /> }}
          rowClassName="hover:bg-blue-50/30 transition-colors" 
        />
      </Card>

      <InventoryModal 
        open={modalOpen} 
        warehouses={warehouses} 
        products={products} 
        onCancel={() => setModalOpen(false)} 
        editingRecord={editingRecord} 
        refreshData={fetchData} 
      />
    </div>
  );
}
