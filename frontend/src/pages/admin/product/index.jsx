import { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Typography, Popconfirm, Tooltip, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ProductFilter from './ProductFilter';
import ProductModal from './ProductModal';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminProduct() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(searchParams),
        categoryService.getAll()
      ]);
      const mappedData = productsRes.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
      setCategories(categoriesRes || []);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu: " + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      message.success("Xoá sản phẩm thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: (text) => <Typography.Text type="secondary" strong>{text}</Typography.Text> },
    { 
      title: 'Tên Sản Phẩm', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Danh Mục', 
      dataIndex: 'category', 
      key: 'category',
      render: (cat) => <Tag color="geekblue" className="rounded-md px-2">{cat?.name || 'Chưa thiết lập'}</Tag>
    },
    { 
      title: 'Đơn Giá', 
      dataIndex: 'price', 
      key: 'price',
      align: 'right',
      render: (val) => <Typography.Text strong className="text-emerald-600">{val?.toLocaleString('vi-VN')} đ</Typography.Text>
    },
    { 
      title: 'ĐVT', 
      dataIndex: 'unit', 
      key: 'unit',
      align: 'center',
      render: (val) => <Tag bordered={false} className="bg-gray-100 text-gray-600 px-2 rounded">{val}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa thông tin">
            <Button 
                type="text" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord({ ...record, category: record.category?._id }); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá sản phẩm này?" description="Thao tác này không thể hoàn tác." okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (nameKeyword, categoryId) => {
    const params = new URLSearchParams();
    if(nameKeyword) params.append('name', nameKeyword);
    if(categoryId) params.append('category', categoryId);
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <InboxOutlined className="text-blue-600" /> Quản Lý Sản Phẩm
          </h1>
          <p className="text-gray-500 mt-2">Quản lý danh sách thu mua, kho hàng và danh mục vật tư.</p>
        </div>
      </div>

      <ProductFilter categories={categories} onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`
          }}
          locale={{ emptyText: <CustomEmpty title="Chưa có sản phẩm" description="Không tìm thấy sản phẩm nào trong hệ thống, vui lòng thêm mới." /> }}
          rowClassName="hover:bg-blue-50/30 transition-colors" 
        />
      </Card>

      <ProductModal open={modalOpen} categories={categories} onCancel={() => setModalOpen(false)} editingRecord={editingRecord} refreshData={fetchData} />
    </div>
  );
}
