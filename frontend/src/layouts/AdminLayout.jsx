import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, TeamOutlined, LogoutOutlined, ShopOutlined, ImportOutlined, ExportOutlined, DatabaseOutlined, FileSearchOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
    { key: 'products', icon: <ShoppingCartOutlined />, label: <Link to="/admin/products">Khối Sản phẩm</Link> },
    { key: 'categories', icon: <AppstoreOutlined />, label: <Link to="/admin/categories">Khối Danh mục</Link> },
    { key: 'warehouses', icon: <ShopOutlined />, label: <Link to="/admin/warehouses">Kho Hàng</Link> },
    { key: 'inventories', icon: <DatabaseOutlined />, label: <Link to="/admin/inventories">Tồn Kho</Link> },
    { key: 'suppliers', icon: <TeamOutlined />, label: <Link to="/admin/suppliers">Nhà Cung Cấp</Link> },
    { key: 'customers', icon: <TeamOutlined />, label: <Link to="/admin/customers">Khách Hàng</Link> },
    { key: 'purchase-orders', icon: <ImportOutlined />, label: <Link to="/admin/purchase-orders">Nhập Hàng (PO)</Link> },
    { key: 'sales-orders', icon: <ExportOutlined />, label: <Link to="/admin/sales-orders">Xuất Hàng (SO)</Link> },
    { key: 'users', icon: <TeamOutlined />, label: <Link to="/admin/users">Tài Khoản</Link> },
    { key: 'auditlog', icon: <FileSearchOutlined />, label: <Link to="/admin/auditlog">Lịch Sử Thao Tác</Link> },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider width={250} theme="light" breakpoint="lg" collapsedWidth="0" className="border-r border-gray-200 shadow-sm z-10">
        <div className="h-16 flex items-center justify-center text-blue-700 text-xl font-black tracking-widest uppercase border-b border-gray-100 bg-white">
          ADMIN PANEL
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['dashboard']} items={menuItems} className="pt-4 font-medium border-r-0" />
      </Sider>
      
      <Layout className="bg-slate-50">
        <Header className="bg-white px-6 shadow-sm flex items-center justify-end h-16 w-full leading-normal z-0 relative">
          <div className="font-semibold text-gray-700 flex items-center">
            Xin chào, SuperAdmin! 
            <Link to="/" className="text-red-500 ml-6 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-md cursor-pointer transition flex items-center gap-2 border border-red-100 text-sm shadow-sm h-9">
              <LogoutOutlined /> Đăng xuất
            </Link>
          </div>
        </Header>
        
        <Content className="overflow-x-hidden overflow-y-auto w-full h-full">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
