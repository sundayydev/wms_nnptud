import { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { supplierService } from '../../services/supplierService';
import { warehouseService } from '../../services/warehouseService';
import API_URL from '../../services/api';

export default function UserPurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu từ điển
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, supRes, whRes] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
        warehouseService.getAll()
      ]);
      setOrders(orderRes);
      setSuppliers(supRes || []);
      setWarehouses(whRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (id) => suppliers.find(s => s._id === id)?.name || id;
  const getWarehouseName = (id) => warehouses.find(w => w._id === id)?.name || id;

  const columns = [
    { 
      title: 'Mã PO', 
      dataIndex: 'poNumber', 
      key: 'poNumber', 
      render: (text, record) => text || record._id?.slice(-8).toUpperCase() 
    },
    { 
      title: 'Nhà cung cấp', 
      dataIndex: 'supplier', 
      key: 'supplier', 
      render: val => getSupplierName(val) || '—' 
    },
    { 
      title: 'Kho nhận', 
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
        if (s === 'Completed') color = 'green';
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
        <Tooltip title="In Phiếu Nhập Kho">
          <Button
            type="text"
            icon={<PrinterOutlined />}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận in phiếu',
                content: 'Bạn có muốn xuất và in phiếu nhập hàng này?',
                okText: 'Đồng ý',
                cancelText: 'Hủy',
                onOk: () => window.open(`${API_URL}/print/purchase-orders/${record._id}`, '_blank')
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Đơn Nhập Hàng (PO)</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <Table rowKey="_id" columns={columns} dataSource={orders} loading={loading} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  );
}
