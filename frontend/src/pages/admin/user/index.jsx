import { useState, useEffect } from 'react';
import { Table, Space, Button, Typography, Popconfirm, Tooltip, message, Card, Input, Modal, Form, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, PlusCircleOutlined, SearchOutlined, LockOutlined } from '@ant-design/icons';
import { userService, roleService } from '../../../services/userService';
import CustomEmpty from '../../../components/CustomEmpty';

export default function AdminUser() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [passwordRecord, setPasswordRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
         userService.getAll(),
         roleService.getAll()
      ]);
      
      // Đẩy tk của mình lên đầu bảng
      usersRes.sort((a, b) => {
          if (a._id === currentUser._id) return -1;
          if (b._id === currentUser._id) return 1;
          return 0;
      });

      const mappedData = usersRes.map(item => ({ ...item, key: item._id }));
      setData(mappedData);
      setRoles(rolesRes);
    } catch (error) {
      console.error('Lỗi tải dữ liệu người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => item.username?.toLowerCase().includes(searchText.toLowerCase()) || item.fullName?.toLowerCase().includes(searchText.toLowerCase()) || item.email?.toLowerCase().includes(searchText.toLowerCase()));

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      message.success("Khóa tài khoản thành công!");
      fetchData();
    } catch (error) {
      message.error("Thao tác thất bại: " + error);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        role: record.role?._id || record.role
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
          if (editingRecord) {
             const payload = { ...values };
             await userService.update(editingRecord._id, payload);
             message.success("Cập nhật thông tin thành công!");
          } else {
             await userService.create(values);
             message.success("Tạo tài khoản mới thành công!");
          }
          fetchData();
          setModalOpen(false);
        } catch (error) {
          message.error("Thao tác thất bại: " + error);
        } finally {
          setIsSubmitting(false);
        }
      })
      .catch((err) => {
        console.error(err);
        message.warning("Vui lòng kiểm tra lại các thông tin bắt buộc!");
      });
  };

  const handleOpenPasswordModal = (record) => {
      setPasswordRecord(record);
      passForm.resetFields();
      setPasswordModalOpen(true);
  };

  const handleUpdatePassword = () => {
      passForm.validateFields()
        .then(async (values) => {
            setIsSubmitting(true);
            try {
                await userService.update(passwordRecord._id, { password: values.newPassword });
                message.success("Đổi mật khẩu thành công!");
                setPasswordModalOpen(false);
            } catch (error) {
                message.error("Đổi mật khẩu thất bại: " + error);
            } finally {
                setIsSubmitting(false);
            }
        }).catch(() => {
            message.warning("Vui lòng nhập mật khẩu mới!");
        });
  };

  const columns = [
    { 
      title: 'Tên Đăng Nhập', 
      dataIndex: 'username', 
      key: 'username',
      render: (text) => <Typography.Text strong className="text-gray-800">{text}</Typography.Text>
    },
    { 
      title: 'Họ và Tên', 
      dataIndex: 'fullName', 
      key: 'fullName',
      render: (text, record) => {
        const isMe = record._id === currentUser._id;
        return (
          <Typography.Text className={`font-medium ${isMe ? 'text-blue-600' : 'text-gray-600'}`}>
            {text || '---'} {isMe && <span className="ml-1 text-sm text-blue-500 font-bold italic">(Bạn)</span>}
          </Typography.Text>
        )
      }
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    { 
      title: 'Phân Quyền', 
      dataIndex: 'role', 
      key: 'role',
      align: 'center',
      render: (roleObj) => {
          const roleName = roleObj?.name;
          return (
            <Tag color={roleName === 'admin' ? 'red' : 'blue'} className="px-3 py-1 text-sm rounded-full font-semibold uppercase">
              {roleName || 'UNKNOWN'}
            </Tag>
          )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const isMe = record._id === currentUser._id;
        return (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button 
                type="text" 
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                icon={<EditOutlined />} 
                onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Đổi mật khẩu">
            <Button 
                type="text" 
                className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 transition-colors" 
                icon={<LockOutlined />} 
                onClick={() => handleOpenPasswordModal(record)} />
          </Tooltip>
          <Tooltip title={isMe ? "Không thể khoá chính mình" : "Khoá tài khoản này"}>
            <Popconfirm title="Bạn có chắc chắn muốn khoá vĩnh viễn quyền truy cập người dùng này?" description="Sẽ không thể đăng nhập hệ thống." okText="Xác nhận" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record._id)}>
              <Button type="text" danger disabled={isMe} className="hover:bg-red-50 transition-colors" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )}
    },
  ];

  return (
    <div className="animate-fade-in p-6 xl:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <UserOutlined className="text-indigo-600" /> Phân Quyền Hệ Thống
          </h1>
          <p className="text-gray-500 mt-2">Quản lý Tài khoản Đăng nhập và Phân quyền truy cập các Modules của WMS.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between gap-4">
        <Input 
          placeholder="Tìm user theo tên, tài khoản, email..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md w-full h-10 rounded-lg bg-gray-50/50"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleOpenModal()} 
            icon={<PlusCircleOutlined />} 
            className="h-10 bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg px-6 font-semibold shadow-md inline-flex items-center"
          >
            Cấp Tài Khoản Mới
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          loading={loading} 
          dataSource={filteredData} 
          columns={columns} 
          pagination={{ pageSize: 10, showSizeChanger: true }} 
          locale={{ emptyText: <CustomEmpty title="Chưa có tài khoản" description="Chưa có dữ liệu người dùng nào." /> }}
          rowClassName={(record) => record._id === currentUser._id ? "bg-blue-50/60 hover:bg-blue-100/50 transition-colors border-l-4 border-blue-500" : "hover:bg-indigo-50/30 transition-colors"} 
        />
      </Card>

      <Modal
        title={
          <div className="text-2xl font-extrabold text-gray-800 pb-4 border-b border-gray-100 flex items-center gap-2">
            {editingRecord ? <><EditOutlined className="text-indigo-500" /> Sửa Thông Tin Tài Khoản</> : <><PlusCircleOutlined className="text-green-500" /> Cấp Tài Khoản Mới</>}
          </div>
        }
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={isSubmitting}
        onCancel={() => setModalOpen(false)}
        width={680}
        okText={editingRecord ? "Cập Nhật" : "Tạo Tài Khoản"}
        cancelText="Hủy Bỏ"
        centered
        className="rounded-2xl overflow-hidden"
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
        cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
      >
        <Form form={form} layout="vertical" className="mt-6" initialValues={{}}>
          <div className="grid grid-cols-2 gap-x-8">
            <Form.Item name="username" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên đăng nhập (Username)</span>} rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}>
              <Input size="large" disabled={!!editingRecord} placeholder="VD: nva_admin" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white disabled:bg-gray-200" />
            </Form.Item>
            
            {!editingRecord && (
              <Form.Item name="password" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mật khẩu</span>} rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                <Input.Password size="large" placeholder="••••••••" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
              </Form.Item>
            )}
            
            {editingRecord && (
              <Form.Item name="fullName" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Họ và Tên</span>}>
                <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
              </Form.Item>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8">
            {!editingRecord && (
              <Form.Item name="fullName" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Họ và Tên</span>}>
                <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
              </Form.Item>
            )}

            <Form.Item name="email" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Email Liên Hệ</span>} rules={[{ required: true, message: 'Nhập email!' }]}>
              <Input size="large" placeholder="example@gmail.com" type="email" className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
            </Form.Item>

            {editingRecord && (
             <Form.Item name="role" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Quyền Truy Cập (Role)</span>} rules={[{ required: true, message: 'Chọn quyền!' }]}>
              <Select size="large" placeholder="-- Gắn quyền cho tài khoản --" className="rounded-lg">
                {roles.map(r => (
                  <Select.Option key={r._id} value={r._id}>{r.name} - {r.description}</Select.Option>
                ))}
              </Select>
             </Form.Item>
            )}
          </div>

          {!editingRecord && (
            <Form.Item name="role" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Quyền Truy Cập (Role)</span>} rules={[{ required: true, message: 'Chọn quyền!' }]}>
              <Select size="large" placeholder="-- Gắn quyền cho tài khoản --" className="rounded-lg">
                {roles.map(r => (
                  <Select.Option key={r._id} value={r._id}>{r.name} - {r.description}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal thay đổi mật khẩu riêng */}
      <Modal
        title={<div className="text-xl font-extrabold text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2"><LockOutlined className="text-orange-500" /> Đổi Mật Khẩu</div>}
        open={passwordModalOpen}
        onOk={handleUpdatePassword}
        confirmLoading={isSubmitting}
        onCancel={() => setPasswordModalOpen(false)}
        width={400}
        okText="Lưu mật khẩu"
        cancelText="Hủy"
        centered
        className="rounded-xl overflow-hidden"
        okButtonProps={{ className: "bg-orange-500 hover:bg-orange-600 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
        cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
      >
        <div className="text-gray-500 mb-4 text-sm">
          Đang cấp lại mật khẩu cho tải khoản: <span className="font-bold text-gray-800">{passwordRecord?.username}</span>
        </div>
        <Form form={passForm} layout="vertical">
             <Form.Item name="newPassword" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mật khẩu mới</span>} rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
                <Input.Password size="large" placeholder="Nhập mật khẩu mới..." className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white" />
             </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
