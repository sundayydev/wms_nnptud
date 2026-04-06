import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Input, Modal, Form, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { customerService } from '../../../services/customerService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminCustomer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  const [searchText, setSearchText] = useState('');

  const fetchData = async (searchParams = '') => {
    try {
      setLoading(true);
      const res = await customerService.getAll(searchParams);
      const mappedData = res.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
    } catch (error) {
      console.error('Lỗi tải khách hàng:', error);
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
      await customerService.delete(id);
      message.success("Xoá khách hàng thành công!");
      fetchData();
    } catch (error) {
      message.error("Xoá thất bại: " + error);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
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
          if (editingRecord) {
             await customerService.update(editingRecord._id, values);
             message.success("Cập nhật thông tin khách hàng thành công!");
          } else {
             await customerService.create(values);
             message.success("Thêm khách hàng mới thành công!");
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
        message.warning("Vui lòng kiểm tra lại các thông tin bắt buộc!");
      });
  };

  const columns = [
    { 
      title: 'Họ & Tên', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Số Điện Thoại', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text) => <Typography.Text className="font-medium text-gray-600">{text}</Typography.Text>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <Typography.Text type="secondary">{text || '---'}</Typography.Text>
    },
    { 
      title: 'Loại Khách Hàng', 
      dataIndex: 'customerType', 
      key: 'customerType',
      align: 'center',
      render: (type) => (
        <Tag color={type === 'Wholesale' ? 'purple' : 'geekblue'} className="px-3 py-1 text-sm rounded-full font-semibold">
          {type === 'Wholesale' ? 'Khách Sỉ' : 'Khách Lẻ'}
        </Tag>
      )
    },
    { 
      title: 'Địa Chỉ', 
      dataIndex: 'address', 
      key: 'address',
      render: (text) => <Typography.Text className="text-gray-500 text-sm max-w-[200px] truncate block" title={text}>{text}</Typography.Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button 
                type="text" 
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Xoá vĩnh viễn">
            <Popconfirm title="Bạn có chắc chắn muốn xoá khách hàng này?" description="Sẽ không thể khôi phục lại dữ liệu." okText="Xác nhận" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
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
             <TeamOutlined className="text-indigo-600" /> Quản Lý Khách Hàng
          </h1>
          <p className="text-gray-500 mt-2">Quản lý cơ sở dữ liệu khách hàng lẻ và đối tác mua sỉ.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between gap-4">
        <Input 
          placeholder="Tìm tên khách hàng..." 
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
            Thêm Khách Hàng
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ pageSize: 10, showSizeChanger: true }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có khách hàng" description="Sổ địa chỉ đang trống." /> }}
          rowClassName="hover:bg-indigo-50/30 transition-colors" 
        />
      </Card>

      <Modal
        title={
          <div className="text-2xl font-extrabold text-gray-800 pb-4 border-b border-gray-100 flex items-center gap-2">
            {editingRecord ? <><EditOutlined className="text-indigo-500" /> Sửa Thông Tin Khách Hàng</> : <><PlusCircleOutlined className="text-green-500" /> Thêm Khách Hàng Mới</>}
          </div>
        }
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={isSubmitting}
        onCancel={() => setModalOpen(false)}
        width={680}
        okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Mới"}
        cancelText="Hủy Bỏ"
        centered
        className="rounded-2xl overflow-hidden"
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
        cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
      >
        <Form form={form} layout="vertical" className="mt-6" initialValues={{ customerType: 'Retail' }}>
          <div className="grid grid-cols-2 gap-x-8">
            <Form.Item name="name" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên Khách Hàng</span>} rules={[{ required: true, message: 'Nhập tên khách hàng!' }]}>
              <Input size="large" placeholder="Nguyễn Văn A..." className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
            </Form.Item>
            
            <Form.Item name="customerType" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Loại Khách Hàng</span>} rules={[{ required: true }]}>
              <Select size="large" className="rounded-lg">
                <Select.Option value="Retail">Khách Lẻ</Select.Option>
                <Select.Option value="Wholesale">Khách Sỉ (Đại lý)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-8">
            <Form.Item name="phone" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Số Điện Thoại</span>} rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
              <Input size="large" placeholder="09xxxxxxxxx" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
            </Form.Item>

            <Form.Item name="email" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Email (Tùy chọn)</span>}>
              <Input size="large" placeholder="example@gmail.com" type="email" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
            </Form.Item>
          </div>

          <Form.Item name="address" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Địa Chỉ Liên Hệ</span>} rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
            <Input.TextArea rows={2} placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
