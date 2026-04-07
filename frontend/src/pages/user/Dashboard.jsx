import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag } from 'antd';
import { FileTextOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { salesOrderService } from '../../services/salesOrderService';
import { purchaseOrderService } from '../../services/purchaseOrderService';

const { Title } = Typography;

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Gọi chung 2 bảng mua/bán
      const [salesOrders, purchaseOrders] = await Promise.all([
        salesOrderService.getAll(),
        purchaseOrderService.getAll()
      ]);

      // Lọc ra hệ thống các đơn phân biệt
      const mySales = salesOrders.filter(order => {
        const creatorId = order.createdBy?._id || order.createdBy;
        return creatorId === user?._id;
      }).map(o => ({ ...o, orderType: 'Bán Hàng' }));

      const myPurchases = purchaseOrders.filter(order => {
        const creatorId = order.createdBy?._id || order.createdBy;
        return creatorId === user?._id;
      }).map(o => ({ ...o, orderType: 'Nhập Vào' }));

      const allMyOrders = [...mySales, ...myPurchases];

      const pendingOrders = allMyOrders.filter(o => o.status === 'Pending').length;
      const completedOrders = allMyOrders.filter(o => o.status === 'Completed').length;

      setStats({
        totalOrders: allMyOrders.length,
        pending: pendingOrders,
        completed: completedOrders,
      });

      // Lấy 5 đơn tạo gần nhất hiển thị dưới bảng (mới nhất đẩy lên đầu)
      const sortedOrders = allMyOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

    } catch (error) {
      console.error("Lỗi khi kéo dữ liệu User Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Phân loại', dataIndex: 'orderType', key: 'orderType', render: text => (
      <Tag color={text === 'Bán Hàng' ? 'purple' : 'cyan'}>{text}</Tag>
    )},
    { title: 'Mã Phiếu', key: 'code', render: (_, record) => record.soNumber || record.poNumber || 'N/A' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: text => (
      <Tag color={text === 'Completed' ? 'success' : text === 'Pending' ? 'warning' : 'default'}>{text}</Tag>
    )},
    { title: 'Giá trị', dataIndex: 'totalAmount', key: 'totalAmount', render: t => `${Number(t || 0).toLocaleString('vi-VN')} đ` }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={3} className="text-gray-800 m-0">Xin chào, {user?.fullName || user?.username} </Title>
        <p className="text-gray-500 mt-2">Dưới đây là tiến độ công việc và số lượng chứng từ bạn đã xử lý.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic 
              title={<span className="text-gray-500 font-medium">Việc của tôi (Tổng số đơn)</span>}
              value={stats.totalOrders} 
              prefix={<FileTextOutlined className="text-blue-500" />} 
              loading={loading}
              styles={{ content: { color: '#2563eb', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic 
              title={<span className="text-gray-500 font-medium">Đang chờ duyệt</span>}
              value={stats.pending} 
              prefix={<SyncOutlined spin className="text-yellow-500" />} 
              loading={loading}
              styles={{ content: { color: '#eab308', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic 
              title={<span className="text-gray-500 font-medium">Đã hoàn thành</span>}
              value={stats.completed} 
              prefix={<CheckCircleOutlined className="text-green-500" />} 
              loading={loading}
              styles={{ content: { color: '#10b981', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row className="mt-8">
        <Col span={24}>
          <Card title="Giao Dịch Gần Đây Nhất Của Bạn" className="shadow-sm rounded-2xl border-none">
            <Table 
               dataSource={recentOrders} 
               columns={columns} 
               rowKey="_id" 
               pagination={false} 
               loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
