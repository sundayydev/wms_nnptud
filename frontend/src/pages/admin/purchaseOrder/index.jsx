import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Tag, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, ImportOutlined, PrinterOutlined } from '@ant-design/icons';
import API_URL from '../../../services/api';
import PurchaseOrderFilter from './PurchaseOrderFilter';
import PurchaseOrderModal from './PurchaseOrderModal';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { supplierService } from '../../../services/supplierService';
import { warehouseService } from '../../../services/warehouseService';
import { productService } from '../../../services/productService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminPurchaseOrder() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Lookups
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchDependencies = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        supplierService.getAll(),
        warehouseService.getAll(),
        productService.getAll()
      ]);
      setSuppliers(supRes || []);
      setWarehouses(whRes || []);
      setProducts(prodRes || []);
    } catch (e) {
      console.log("Error loading dependencies", e);
    }
  };

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await purchaseOrderService.getAll(searchParams);
      const mappedData = res.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
    } catch (error) {
      // ignore init 500
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await purchaseOrderService.delete(id);
      message.success("Xoá PO thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  // Helper to map IDs to Names
  const getSupplierName = (id) => suppliers.find(s => s._id === id)?.name || id;
  const getWarehouseName = (id) => warehouses.find(w => w._id === id)?.name || id;

  const columns = [
    { 
      title: 'Mã PO', 
      dataIndex: 'poNumber', 
      key: 'poNumber',
      render: (text) => <Typography.Text strong className="text-violet-700">{text}</Typography.Text>
    },
    { 
      title: 'Nhà Cung Cấp', 
      dataIndex: 'supplier', 
      key: 'supplier',
      render: (val) => <Typography.Text>{getSupplierName(val)}</Typography.Text>
    },
    { 
      title: 'Kho Nhập', 
      dataIndex: 'warehouse', 
      key: 'warehouse',
      render: (val) => <Typography.Text type="secondary">{getWarehouseName(val)}</Typography.Text>
    },
    { 
      title: 'Tổng Items', 
      dataIndex: 'items', 
      key: 'items',
      align: 'center',
      render: (items) => <Tag color="blue">{items?.length || 0} SP</Tag>
    },
    { 
      title: 'Tổng Tiền', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      align: 'right',
      render: (val) => <Typography.Text strong className="text-gray-800">{val?.toLocaleString('vi-VN')} đ</Typography.Text>
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'cyan';
        else if (status === 'Completed') color = 'green';
        else if (status === 'Cancelled') color = 'red';
        else if (status === 'Pending') color = 'orange';
        return <Tag color={color} className="uppercase font-bold">{status}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="In Phiếu Nhập Kho">
            <Button
              type="text"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              icon={<PrinterOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận in phiếu',
                  content: 'Bạn có muốn xuất và in phiếu yêu cầu nhập kho này?',
                  okText: 'Đồng ý',
                  cancelText: 'Hủy',
                  onOk: () => window.open(`${API_URL}/print/purchase-orders/${record._id}`, '_blank')
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa PO">
            <Button 
                type="text" 
                className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord(record); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá PO này?" okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (keyword, status) => {
    const params = new URLSearchParams();
    if(keyword) params.append('poNumber', keyword); 
    if(status) params.append('status', status); 
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <ImportOutlined className="text-violet-600" /> Nhập Hàng (Purchase Orders)
          </h1>
          <p className="text-gray-500 mt-2">Quản lý các luồng phiếu nhập kho từ nhà cung cấp.</p>
        </div>
      </div>

      <PurchaseOrderFilter onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có phiếu nhập" description="Hệ thống chưa có đơn PO nào, nhấn tạo mới." /> }}
          rowClassName="hover:bg-violet-50/30 transition-colors" 
        />
      </Card>

      <PurchaseOrderModal 
        open={modalOpen} 
        suppliers={suppliers}
        warehouses={warehouses}
        products={products}
        onCancel={() => setModalOpen(false)} 
        editingRecord={editingRecord} 
        refreshData={fetchData} 
      />
    </div>
  );
}
