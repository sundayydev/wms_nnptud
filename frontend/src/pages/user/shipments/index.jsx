import { useState, useEffect } from 'react';
import { Table, Typography, Card, Tag } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { shipmentService } from '../../../services/shipmentService';
import { salesOrderService } from '../../../services/salesOrderService';
import CustomEmpty from '../../../components/CustomEmpty';
import dayjs from 'dayjs';

export default function UserShipment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);

  const fetchDependencies = async () => {
    try {
      const soRes = await salesOrderService.getAll();
      setSalesOrders(soRes || []);
    } catch (e) {
      console.log("Error loading dependencies", e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await shipmentService.getAll();
      
      const mappedData = (res || []).map(item => ({ ...item, key: item._id }));
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
    }
  ];

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <CarOutlined className="text-blue-600" /> Theo dõi Giao Hàng
          </h1>
          <p className="text-gray-500 mt-2">Xem trạng thái các đơn vị vận chuyển đang xử lý.</p>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có vận đơn" description="Hiện tại chưa có đơn hàng nào đang được vận chuyển." /> }}
          rowClassName="hover:bg-blue-50/30 transition-colors" 
        />
      </Card>
    </div>
  );
}
