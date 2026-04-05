import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import SupplierFilter from './SupplierFilter';
import SupplierModal from './SupplierModal';
import { supplierService } from '../../../services/supplierService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminSupplier() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await supplierService.getAll(searchParams);
      const mappedData = res.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
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
      await supplierService.delete(id);
      message.success("Xoá nhà cung cấp thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const columns = [
    { 
      title: 'Tên Nhà Cung Cấp', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Người Liên Hệ', 
      dataIndex: 'contactPerson', 
      key: 'contactPerson',
      render: (text) => <Typography.Text>{text || 'N/A'}</Typography.Text>
    },
    { 
      title: 'Điện Thoại', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text) => <Typography.Text strong className="text-gray-600">{text}</Typography.Text>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <Typography.Text type="secondary">{text || 'N/A'}</Typography.Text>
    },
    { 
      title: 'Địa Chỉ', 
      dataIndex: 'address', 
      key: 'address',
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
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
                className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord(record); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá?" description="Thao tác này không thể hoàn tác." okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (keyword) => {
    const params = new URLSearchParams();
    if(keyword) params.append('name', keyword);
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <TeamOutlined className="text-green-600" /> Quản Lý Đối Tác & NCC
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi và cập nhật thông tin mạng lưới nhà cung cấp.</p>
        </div>
      </div>

      <SupplierFilter onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có đối tác/nhà cung cấp" description="Hệ thống chưa có bên cung cấp nào, hãy tạo mới." /> }}
          rowClassName="hover:bg-green-50/30 transition-colors" 
        />
      </Card>

      <SupplierModal open={modalOpen} onCancel={() => setModalOpen(false)} editingRecord={editingRecord} refreshData={fetchData} />
    </div>
  );
}
