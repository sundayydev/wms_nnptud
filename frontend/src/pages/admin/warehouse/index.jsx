import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import WarehouseFilter from './WarehouseFilter';
import WarehouseModal from './WarehouseModal';
import { warehouseService } from '../../../services/warehouseService';
import { userService } from '../../../services/userService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminWarehouse() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const [warehousesRes, usersRes] = await Promise.all([
        warehouseService.getAll(searchParams),
        userService.getAll()
      ]);
      const mappedData = warehousesRes.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
      setUsers(usersRes?.filter(u => u.role?.name === 'Warehouse Manager' || u.role?.name === 'Admin') || usersRes || []);
    } catch (error) {
      // Ignore initial render errors if backend has just restarted
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await warehouseService.delete(id);
      message.success("Xoá kho thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const columns = [
    { 
      title: 'Tên Kho', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Địa Chỉ', 
      dataIndex: 'location', 
      key: 'location',
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    { 
      title: 'Quản Lý', 
      dataIndex: 'manager', 
      key: 'manager',
      render: (mgr) => <Typography.Text>{mgr?.username || mgr?.name || mgr?.email || 'N/A'}</Typography.Text>
    },
    { 
      title: 'Sức Chứa', 
      dataIndex: 'capacity', 
      key: 'capacity',
      align: 'right',
      render: (val) => <span className="font-bold text-indigo-700">{val ? `${val.toLocaleString('vi-VN')} m³` : 'N/A'}</span>
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
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => { 
                setEditingRecord({ ...record, manager: record.manager?._id }); 
                setModalOpen(true); 
            }} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá kho này?" description="Thao tác này không thể hoàn tác." okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (nameKeyword) => {
    const params = new URLSearchParams();
    if(nameKeyword) params.append('name', nameKeyword);
    fetchData('?' + params.toString());
  };

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <ShopOutlined className="text-indigo-600" /> Quản Lý Kho
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi và quản lý thông tin các kho bãi trong hệ thống.</p>
        </div>
      </div>

      <WarehouseFilter onSearch={handleSearch} onOpenModal={() => { setEditingRecord(null); setModalOpen(true); }} />

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-6" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
          }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có kho hàng" description="Không có kho hàng nào đang hoạt động, hãy ấn thêm mới." /> }}
          rowClassName="hover:bg-indigo-50/30 transition-colors" 
        />
      </Card>

      <WarehouseModal open={modalOpen} users={users} onCancel={() => setModalOpen(false)} editingRecord={editingRecord} refreshData={fetchData} />
    </div>
  );
}
