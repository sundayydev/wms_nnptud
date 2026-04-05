import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import SalesOrderFilter from './SalesOrderFilter';
import SalesOrderModal from './SalesOrderModal';
import { salesOrderService } from '../../../services/salesOrderService';
import { customerService } from '../../../services/customerService';
import { warehouseService } from '../../../services/warehouseService';
import { productService } from '../../../services/productService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminSalesOrder() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Lookups
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchDependencies = async () => {
    try {
      const [cusRes, whRes, prodRes] = await Promise.all([
        customerService.getAll(),
        warehouseService.getAll(),
        productService.getAll()
      ]);
      setCustomers(cusRes || []);
      setWarehouses(whRes || []);
      setProducts(prodRes || []);
    } catch (e) {
      console.log("Error loading dependencies", e);
    }
  };

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await salesOrderService.getAll(searchParams);
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
      await salesOrderService.delete(id);
      message.success("Xoá SO thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  // Helper to map IDs to Names
  const getCustomerName = (id) => customers.find(c => c._id === id)?.name || id;
  const getWarehouseName = (id) => warehouses.find(w => w._id === id)?.name || id;

  const columns = [
    { 
      title: 'Mã SO', 
      dataIndex: 'soNumber', 
      key: 'soNumber',
      render: (text) => <Typography.Text strong className="text-rose-700">{text}</Typography.Text>
    },
    { 
      title: 'Khách Hàng', 
      dataIndex: 'customer', 
      key: 'customer',
      render: (val) => <Typography.Text>{getCustomerName(val)}</Typography.Text>
    },
    { 
      title: 'Xuất Từ Kho', 
      dataIndex: 'warehouse', 
      key: 'warehouse',
      render: (val) => <Typography.Text type="secondary">{getWarehouseName(val)}</Typography.Text>
    },
    { 
      title: 'Tổng Items', 
      dataIndex: 'items', 
      key: 'items',
      align: 'center',
      render: (items) => <Tag color="magenta">{items?.length || 0} SP</Tag>
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
        if (status === 'Processing') color = 'blue';
        else if (status === 'Shipped') color = 'cyan';
        else if (status === 'Delivered') color = 'green';
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
          <Tooltip title="Chỉnh sửa SO">
            <Button 
                type="text" 
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord(record); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá SO này?" okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (keyword, status) => {
    const params = new URLSearchParams();
    if(keyword) params.append('soNumber', keyword); 
    if(status) params.append('status', status); 
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <ExportOutlined className="text-rose-600" /> Xuất Hàng (Sales Orders)
          </h1>
          <p className="text-gray-500 mt-2">Quản lý các luồng phiếu xuất kho, bán hàng cho đối tác.</p>
        </div>
      </div>

      <SalesOrderFilter onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có phiếu xuất" description="Hệ thống chưa có đơn SO nào, nhấn tạo đơn xuất mới." /> }}
          rowClassName="hover:bg-rose-50/30 transition-colors" 
        />
      </Card>

      <SalesOrderModal 
        open={modalOpen} 
        customers={customers}
        warehouses={warehouses}
        products={products}
        onCancel={() => setModalOpen(false)} 
        editingRecord={editingRecord} 
        refreshData={fetchData} 
      />
    </div>
  );
}
