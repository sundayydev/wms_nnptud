import { useEffect, useState } from 'react';
import { Table, Tag, Button, Tooltip, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import API_URL from '../../services/api';

export default function UserPurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = { pending: 'orange', completed: 'green', cancelled: 'red' };

  const columns = [
    { title: 'Mã PO', dataIndex: '_id', key: '_id', render: id => id?.slice(-8).toUpperCase() },
    { title: 'Nhà cung cấp', dataIndex: ['supplier', 'name'], key: 'supplier', render: v => v || '—' },
    { title: 'Kho nhận', dataIndex: ['warehouse', 'name'], key: 'warehouse', render: v => v || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color={statusColor[s] || 'default'}>{s?.toUpperCase()}</Tag>,
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
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Đơn Nhập Hàng (PO)</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table rowKey="_id" columns={columns} dataSource={orders} loading={loading} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  );
}
