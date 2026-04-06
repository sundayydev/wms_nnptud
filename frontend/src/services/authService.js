import API_URL from './api';

// Map backend error messages to Vietnamese
const mapErrorMessage = (msg) => {
  if (!msg) return 'Đã có lỗi xảy ra, vui lòng thử lại.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối.';
  }
  if (msg.includes('dang nhap khong dung') || msg.includes('thong tin')) {
    return 'Sai tên đăng nhập hoặc mật khẩu.';
  }
  if (msg.includes('dang bi ban') || msg.includes('ban')) {
    return 'Tài khoản tạm thời bị khóa. Vui lòng thử lại sau 1 giờ.';
  }
  if (msg.includes('da ton tai') || msg.includes('duplicate') || msg.includes('E11000')) {
    return 'Tên đăng nhập hoặc email đã tồn tại.';
  }
  return msg;
};

export const authService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Phản hồi từ máy chủ không hợp lệ.');
      }

      if (!response.ok) {
        throw new Error(mapErrorMessage(data?.message || data));
      }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
      }
      throw err;
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(mapErrorMessage(data?.message || JSON.stringify(data)));
      }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
      }
      throw err;
    }
  }
};
