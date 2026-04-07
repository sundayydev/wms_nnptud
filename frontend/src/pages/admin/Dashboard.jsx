import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import { AppstoreOutlined, TeamOutlined, SkinOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { salesOrderService } from '../../services/salesOrderService';
import { purchaseOrderService } from '../../services/purchaseOrderService';

const { Title } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalWarehouses: 0,
    totalRevenue: 0,
    totalExpense: 0,
  });

  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi cả 5 APIs cùng lúc bằng Promise.all để load trang cực nhanh
      const [users, products, warehouses, salesOrders, purchaseOrders] = await Promise.all([
        userService.getAll(),
        productService.getAll(),
        warehouseService.getAll(),
        salesOrderService.getAll(),
        purchaseOrderService.getAll(),
      ]);

      // Bắt đầu nhẩm tính doanh thu dựa trên Array
      const revenue = salesOrders
        .filter(order => order.status === 'Completed' || order.status === 'Pending')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const expense = purchaseOrders
        .filter(order => order.status === 'Completed' || order.status === 'Pending')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        totalRevenue: revenue,
        totalExpense: expense,
      });

      // Lấy 5 đơn bán hàng gần nhất để làm bảng báo cáo
      setRecentSales(salesOrders.slice(0, 5));
    } catch (error) {
      console.error("Lỗi khi kéo dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'soNumber', key: 'soNumber' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: text => (
      <Tag color={text === 'Completed' ? 'success' : text === 'Pending' ? 'warning' : 'default'}>{text}</Tag>
    )},
    { title: 'Tổng thu', dataIndex: 'totalAmount', key: 'totalAmount', render: t => `${Number(t).toLocaleString('vi-VN')} đ` }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2} className="mb-6 text-gray-800">Thống Kê Tổng Quan</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic 
              title={<span className="text-gray-500 font-medium">Doanh Thu Tạm Tính</span>}
              value={stats.totalRevenue} 
              prefix={<DollarOutlined className="text-green-500" />} 
              suffix="đ" 
              loading={loading} 
              styles={{ content: { color: '#10b981', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic 
              title={<span className="text-gray-500 font-medium">Chi Phí Nhập Hàng</span>}
              value={stats.totalExpense} 
              prefix={<ShoppingCartOutlined className="text-red-500" />} 
              suffix="đ" 
              loading={loading} 
              styles={{ content: { color: '#ef4444', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic title="Tổng kho" value={stats.totalWarehouses} prefix={<AppstoreOutlined className="text-blue-500"/>} loading={loading} />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic title="Mặt Hàng" value={stats.totalProducts} prefix={<SkinOutlined className="text-orange-500"/>} loading={loading} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic title="Nhân viên" value={stats.totalUsers} prefix={<TeamOutlined className="text-purple-500"/>} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Row className="mt-8">
        <Col span={24}>
          <Card title="Giao Dịch Bán Hàng Gần Đây" className="shadow-sm rounded-2xl border-none">
            <Table 
               dataSource={recentSales} 
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
