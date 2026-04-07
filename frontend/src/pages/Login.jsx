import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../services/authService';

const { Title, Text } = Typography;

export default function Login() {
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Xoá state message khỏi history để không hiện lại khi reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Ant Design truyền thẳng object chứa các trường (username, password) vào onFinish
  const onFinish = async (values) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await authService.login(values.username, values.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const roleName = data.user.role?.name;
      if (roleName === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      setError(err?.message || err?.toString() || 'Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] border border-gray-100">

        <div className="text-center mb-6">
          <Title level={2} style={{ color: '#1677ff', marginTop: 0, marginBottom: '8px' }}>
            Đăng Nhập
          </Title>
          <Text type="secondary">Vui lòng đăng nhập để tiếp tục</Text>
        </div>

        {successMsg && (
          <Alert
            message={successMsg}
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item className="mt-6 mb-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}