import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { ThunderboltFilled, HomeOutlined, ShoppingOutlined, LoginOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { key: '1', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
    { key: '2', icon: <ShoppingOutlined />, label: <Link to="/products">Sản phẩm</Link> },
  ];

  const userDropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <span className="text-gray-600 text-sm">Xin chào, <strong>{user?.username}</strong></span>,
        disabled: true,
      },
      { type: 'divider' },
      ...(user?.role?.name === 'admin' ? [{
        key: 'admin',
        icon: <UserOutlined />,
        label: <Link to="/admin">Trang Admin</Link>,
      }] : []),
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
      <Header className="bg-white px-8 flex items-center shadow-sm z-10 sticky top-0">
        <div className="text-2xl font-black text-blue-600 mr-12 tracking-tighter flex items-center gap-1">
          <ThunderboltFilled className="text-yellow-500" /> Treeb
        </div>

        <Menu mode="horizontal" items={navItems} className="flex-1 border-b-0 text-md" />

        {/* Phần bên phải header */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <Dropdown menu={userDropdownItems} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 transition border border-gray-200">
                <Avatar size={30} icon={<UserOutlined />} className="bg-blue-500" />
                <span className="font-semibold text-gray-700 text-sm">{user.username}</span>
                <span className="text-xs text-gray-400">▾</span>
              </div>
            </Dropdown>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm no-underline"
            >
              <LoginOutlined /> Đăng nhập
            </Link>
          )}
        </div>
      </Header>
      
      <Content className="p-8 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-6xl flex-1 animate-fade-in">
          <Outlet />
        </div>
      </Content>
      
      <Footer className="text-center bg-white border-t border-gray-200">
        Treeb WMS System ©{new Date().getFullYear()} Created with Ant Design & Tailwind
      </Footer>
    </Layout>
  );
}
