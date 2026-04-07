import { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { salesOrderService } from '../../services/salesOrderService';
import { customerService } from '../../services/customerService';
import { warehouseService } from '../../services/warehouseService';
import API_URL from '../../services/api';

export default function UserSalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu từ điển 
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, cusRes, whRes] = await Promise.all([
        salesOrderService.getAll(),
        customerService.getAll(),
        warehouseService.getAll()
      ]);
      setOrders(orderRes);
      setCustomers(cusRes || []);
      setWarehouses(whRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (id) => customers.find(c => c._id === id)?.name || id;
  const getWarehouseName = (id) => warehouses.find(w => w._id === id)?.name || id;

  const columns = [
    { 
      title: 'Mã SO', 
      dataIndex: 'soNumber', 
      key: 'soNumber', 
      render: (text, record) => text || record._id?.slice(-8).toUpperCase() 
    },
    { 
      title: 'Khách hàng', 
      dataIndex: 'customer', 
      key: 'customer', 
      render: val => getCustomerName(val) || '—' 
    },
    { 
      title: 'Kho xuất', 
      dataIndex: 'warehouse', 
      key: 'warehouse', 
      render: val => getWarehouseName(val) || '—' 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => {
        let color = 'default';
        if (s === 'Processing') color = 'blue';
        else if (s === 'Shipped') color = 'cyan';
        else if (s === 'Delivered') color = 'green';
        else if (s === 'Cancelled') color = 'red';
        else if (s === 'Pending') color = 'orange';
        return <Tag color={color} className="uppercase font-bold">{s}</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: d => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title="In Phiếu Xuất Kho">
          <Button
            type="text"
            icon={<PrinterOutlined />}
            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận in phiếu',
                content: 'Bạn có muốn xuất và in phiếu xuất hàng này?',
                okText: 'Đồng ý',
                cancelText: 'Hủy',
                onOk: () => window.open(`${API_URL}/print/sales-orders/${record._id}`, '_blank')
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Đơn Xuất Hàng (SO)</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table rowKey="_id" columns={columns} dataSource={orders} loading={loading} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  );
}
