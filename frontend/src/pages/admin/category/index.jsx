import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Input, Modal, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined, TagsOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { categoryService } from '../../../services/categoryService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminCategory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  // Search state
  const [searchText, setSearchText] = useState('');

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await categoryService.getAll(searchParams);
      const mappedData = res.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    fetchData('?' + params.toString());
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      message.success("Xoá danh mục thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        parentCategory: record.parentCategory?._id || record.parentCategory || null
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(async (values) => {
        setIsSubmitting(true);
        try {
          if (!values.parentCategory) values.parentCategory = null;

          if (editingRecord) {
             await categoryService.update(editingRecord._id, values);
             message.success("Cập nhật danh mục thành công!");
          } else {
             await categoryService.create(values);
             message.success("Thêm danh mục mới thành công!");
          }
          fetchData();
          setModalOpen(false);
        } catch (error) {
          message.error("Thao tác thất bại: " + error);
        } finally {
          setIsSubmitting(false);
        }
      })
      .catch(() => {
        message.warning("Vui lòng điền đủ thông tin!");
      });
  };

  const columns = [
    { 
      title: 'Tên Danh Mục', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Mô Tả', 
      dataIndex: 'description', 
      key: 'description',
      render: (text) => <Typography.Text type="secondary">{text || 'Không có mô tả'}</Typography.Text>
    },
    { 
      title: 'Danh Mục Cha', 
      dataIndex: 'parentCategory', 
      key: 'parentCategory',
      render: (parent) => <Typography.Text>{parent ? (parent.name || 'Có danh mục cha') : '---'}</Typography.Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa danh mục">
            <Button 
                type="text" 
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có muốn xoá danh mục này?" okText="Xoá" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <TagsOutlined className="text-indigo-600" /> Quản Lý Danh Mục
          </h1>
          <p className="text-gray-500 mt-2">Phân loại và cấu trúc hàng hoá của bạn qua các danh mục tĩnh.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between gap-4">
        <Input 
          placeholder="Tìm tên danh mục..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md w-full h-10 rounded-lg bg-gray-50/50"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Space>
          <Button onClick={handleSearch} className="h-10 rounded-lg px-6">Lọc kết quả</Button>
          <Button 
            type="primary" 
            onClick={() => handleOpenModal()} 
            icon={<PlusCircleOutlined />} 
            className="h-10 bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg px-6 font-semibold shadow-md inline-flex items-center"
          >
            Thêm Danh Mục
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ pageSize: 10, showSizeChanger: true }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có danh mục" description="Chưa có dữ liệu danh mục nào trong kho." /> }}
          rowClassName="hover:bg-indigo-50/30 transition-colors" 
        />
      </Card>

      <Modal
        title={
          <div className="text-2xl font-extrabold text-gray-800 pb-4 border-b border-gray-100 flex items-center gap-2">
            {editingRecord ? <><EditOutlined className="text-indigo-500" /> Cập Nhật Danh Mục</> : <><PlusCircleOutlined className="text-green-500" /> Thêm Danh Mục</>}
          </div>
        }
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={isSubmitting}
        onCancel={() => setModalOpen(false)}
        width={500}
        okText={editingRecord ? "Lưu" : "Thêm mới"}
        cancelText="Hủy"
        centered
        className="rounded-2xl overflow-hidden"
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
        cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item name="name" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên Danh Mục</span>} rules={[{ required: true, message: 'Nhập tên!' }]}>
            <Input size="large" placeholder="Ví dụ: Đồ điện tử..." className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
          </Form.Item>
          
          <Form.Item name="parentCategory" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Danh mục cha (Tùy chọn)</span>}>
            <Select size="large" allowClear placeholder="Chọn danh mục cha" className="rounded-lg">
              {data.filter(item => item._id !== editingRecord?._id).map(cat => (
                <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mô Tả</span>}>
            <Input.TextArea rows={3} placeholder="Mô tả danh mục..." className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
