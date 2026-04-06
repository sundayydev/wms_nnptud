const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const handleResponse = async (response) => {
  // Bắt lỗi 401 (Unauthorized) từ backend chặn
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return Promise.reject("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) return Promise.reject(response.statusText);
    return null;
  }

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  return data;
};

export default API_URL;
