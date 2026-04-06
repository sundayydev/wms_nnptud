import { useEffect, useState } from 'react';
import { Table, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { productService } from '../../services/productService';

export default function UserProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat?.name || '—'}</Tag>,
    },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price?.toLocaleString('vi-VN') + ' đ',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Danh Sách Sản Phẩm</h1>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc SKU..."
          className="w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
