import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, CarOutlined } from '@ant-design/icons';
import ShipmentFilter from './ShipmentFilter';
import ShipmentModal from './ShipmentModal';
import { shipmentService } from '../../../services/shipmentService';
import { salesOrderService } from '../../../services/salesOrderService';
import CustomEmpty from '../../../components/CustomEmpty';
import dayjs from 'dayjs';

export default function AdminShipment() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Lookups
  const [salesOrders, setSalesOrders] = useState([]);

  const fetchDependencies = async () => {
    try {
      const soRes = await salesOrderService.getAll();
      setSalesOrders(soRes || []);
    } catch (e) {
      console.log("Error loading dependencies", e);
    }
  };

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await shipmentService.getAll(searchParams);
      
      // Client-side filtering logic as API might return all if params aren't handled well by backend
      let parsedData = res || [];
      const params = new URLSearchParams(searchParams);
      const keyword = params.get('trackingNumber');
      const statusParam = params.get('status');

      if (keyword) {
           parsedData = parsedData.filter(item => item.trackingNumber?.toLowerCase().includes(keyword.toLowerCase()));
      }
       if (statusParam) {
           parsedData = parsedData.filter(item => item.status === statusParam);
      }

      const mappedData = parsedData.map(item => ({ ...item, key: item._id }));
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
      await shipmentService.delete(id);
      message.success("Xoá vận đơn thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  // Helper to map IDs to Names
  const getSONumber = (id) => {
      const so = salesOrders.find(s => s._id === id);
      return so ? so.soNumber : 'N/A';
  }

  const columns = [
    { 
      title: 'Mã SO', 
      dataIndex: 'order', 
      key: 'order',
      render: (val) => <Typography.Text strong className="text-gray-800">{getSONumber(val)}</Typography.Text>
    },
    { 
      title: 'Mã Vận Đơn', 
      dataIndex: 'trackingNumber', 
      key: 'trackingNumber',
      render: (text) => <Typography.Text className="text-blue-600 font-medium">{text || 'N/A'}</Typography.Text>
    },
    { 
      title: 'Đối tác (Carrier)', 
      dataIndex: 'carrier', 
      key: 'carrier',
      render: (val) => <Typography.Text>{val || 'N/A'}</Typography.Text>
    },
     { 
      title: 'Ngày Xuất', 
      dataIndex: 'shippedDate', 
      key: 'shippedDate',
      render: (val) => <Typography.Text type="secondary">{val ? dayjs(val).format('DD/MM/YYYY') : '---'}</Typography.Text>
    },
     { 
      title: 'Dự Kiến Giao', 
      dataIndex: 'estimatedDelivery', 
      key: 'estimatedDelivery',
      render: (val) => <Typography.Text type="secondary">{val ? dayjs(val).format('DD/MM/YYYY') : '---'}</Typography.Text>
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'default';
        if (status === 'Preparing') color = 'orange';
        else if (status === 'In Transit') color = 'blue';
        else if (status === 'Delivered') color = 'green';
        else if (status === 'Failed') color = 'red';
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
          <Tooltip title="Chỉnh sửa Vận Đơn">
            <Button 
                type="text" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord(record); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá vận đơn này?" okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (keyword, status) => {
    const params = new URLSearchParams();
    if(keyword) params.append('trackingNumber', keyword); 
    if(status) params.append('status', status); 
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <CarOutlined className="text-blue-600" /> Quản Lý Giao Hàng (Shipments)
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi và cập nhật trạng thái vận đơn của các đơn xuất.</p>
        </div>
      </div>

      <ShipmentFilter onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có vận đơn" description="Hệ thống chưa có Shipment nào." /> }}
          rowClassName="hover:bg-blue-50/30 transition-colors" 
        />
      </Card>

      <ShipmentModal 
        open={modalOpen} 
        salesOrders={salesOrders}
        onCancel={() => setModalOpen(false)} 
        editingRecord={editingRecord} 
        refreshData={fetchData} 
      />
    </div>
  );
}
