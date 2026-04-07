import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, List, Empty } from 'antd';
import { AppstoreOutlined, TeamOutlined, SkinOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { io } from 'socket.io-client';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { salesOrderService } from '../../services/salesOrderService';
import { purchaseOrderService } from '../../services/purchaseOrderService';

const { Title } = Typography;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(function () {
    fetchData();
  }, []);

  useEffect(function () {
    let socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('sales-order-created', function (order) {
      setRecentOrders(function (currentOrders) {
        let nextOrders = [order, ...currentOrders];
        return nextOrders.slice(0, 5);
      });
    });

    return function () {
      socket.disconnect();
    };
  }, []);

  const fetchData = async function () {
    try {
      setLoading(true);
      let [users, products, warehouses, salesOrders, purchaseOrders] = await Promise.all([
        userService.getAll(),
        productService.getAll(),
        warehouseService.getAll(),
        salesOrderService.getAll(),
        purchaseOrderService.getAll(),
      ]);

      let revenue = salesOrders
        .filter(function (order) {
          return order.status === 'Completed' || order.status === 'Pending';
        })
        .reduce(function (sum, order) {
          return sum + (order.totalAmount || 0);
        }, 0);

      let expense = purchaseOrders
        .filter(function (order) {
          return order.status === 'Completed' || order.status === 'Pending';
        })
        .reduce(function (sum, order) {
          return sum + (order.totalAmount || 0);
        }, 0);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        totalRevenue: revenue,
        totalExpense: expense,
      });

      setRecentSales(salesOrders.slice(0, 5));
    } catch (error) {
      console.error('Loi khi tai dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'soNumber', key: 'soNumber' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: function (text) {
        return (
          <Tag color={text === 'Completed' ? 'success' : text === 'Pending' ? 'warning' : 'default'}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Tổng thu',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: function (value) {
        return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div>
        <Title level={2} className="!mb-1 !text-gray-800">Thống Kê Tổng Quan</Title>
        <p className="text-gray-500">Tổng hợp dữ liệu hệ thống và theo dõi realtime đơn bán hàng.</p>
      </div>

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
            <Statistic title="Tổng kho" value={stats.totalWarehouses} prefix={<AppstoreOutlined className="text-blue-500" />} loading={loading} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic title="Mặt Hàng" value={stats.totalProducts} prefix={<SkinOutlined className="text-orange-500" />} loading={loading} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl border-none">
            <Statistic title="Nhân viên" value={stats.totalUsers} prefix={<TeamOutlined className="text-purple-500" />} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24} xl={14}>
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

        <Col span={24} xl={10}>
          <Card title="Live Sales Orders" className="shadow-sm border border-gray-100 rounded-2xl">
            {recentOrders.length ? (
              <List
                dataSource={recentOrders}
                rowKey="_id"
                renderItem={function (item) {
                  return (
                    <List.Item>
                      <div className="flex w-full items-center justify-between gap-4">
                        <div>
                          <Typography.Text strong>{item.soNumber || item._id}</Typography.Text>
                          <div className="text-sm text-gray-500">
                            Total: {item.totalAmount} | {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'now'}
                          </div>
                        </div>
                        <Tag color="green">{item.status || 'Pending'}</Tag>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="Chưa có đơn hàng mới trong phiên này" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
