import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { ThunderboltFilled, HomeOutlined, ShoppingOutlined, LoginOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export default function MainLayout() {
  const items = [
    { key: '1', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
    { key: '2', icon: <ShoppingOutlined />, label: <Link to="/products">Sản phẩm</Link> },
    { key: '3', icon: <LoginOutlined />, label: <Link to="/login">Đăng nhập</Link> },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-8 flex items-center shadow-sm z-10 sticky top-0">
        <div className="text-2xl font-black text-blue-600 mr-12 tracking-tighter flex items-center gap-1">
          <ThunderboltFilled className="text-yellow-500" /> Treeb
        </div>
        <Menu mode="horizontal" items={items} className="flex-1 border-b-0 text-md" />
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
