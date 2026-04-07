import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  UserOutlined,
  LogoutOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function UserLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { key: 'dashboard',      icon: <DashboardOutlined />, label: <Link to="/user">Tổng Quan</Link> },
    { key: 'products',       icon: <ShoppingOutlined />,  label: <Link to="/user/products">Sản Phẩm</Link> },
    { key: 'inventories',    icon: <DatabaseOutlined />,  label: <Link to="/user/inventories">Tồn Kho</Link> },
    { key: 'purchase-orders',icon: <ImportOutlined />,    label: <Link to="/user/purchase-orders">Nhập Hàng (PO)</Link> },
    { key: 'sales-orders',   icon: <ExportOutlined />,    label: <Link to="/user/sales-orders">Xuất Hàng (SO)</Link> },
    { key: 'shipments',      icon: <ExportOutlined />,    label: <Link to="/user/shipments">Giao Hàng</Link> },
  ];

  const dropdownItems = {
    items: [
      {
        key: 'info',
        icon: <UserOutlined />,
        label: <span className="text-gray-500 text-sm">Nhân viên: <strong>{user?.username}</strong></span>,
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span className="text-red-500">Đăng xuất</span>,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="min-h-screen">
      <Sider width={230} theme="light" breakpoint="lg" collapsedWidth="0" className="border-r border-gray-200 shadow-sm">
        <div className="h-16 flex flex-col items-center justify-center border-b border-gray-100 bg-white">
          <div className="text-blue-600 text-lg font-black tracking-wide flex items-center gap-1">
            <ThunderboltFilled className="text-yellow-500" /> Treeb
          </div>
          <span className="text-xs text-gray-400 font-medium">Nhân Viên Kho</span>
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['dashboard']} items={menuItems} className="pt-4 font-medium border-r-0" />
      </Sider>

      <Layout className="bg-slate-50">
        <Header className="bg-white px-6 shadow-sm flex items-center justify-between h-16 z-0 relative">
          <span className="text-gray-500 text-sm font-medium"> Cổng Nhân Viên Kho</span>
          <Dropdown menu={dropdownItems} placement="bottomRight" trigger={['click']}>
            <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition">
              <Avatar size={28} icon={<UserOutlined />} className="bg-green-500" />
              <span className="font-semibold text-gray-700 text-sm">{user?.username}</span>
              <span className="text-xs text-gray-400">▾</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="overflow-x-hidden overflow-y-auto w-full h-full">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
