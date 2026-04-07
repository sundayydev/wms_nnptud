import API_URL, { handleResponse } from './api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const notificationService = {
  getAll: async (query = '') => {
    const response = await fetch(`${API_URL}/notifications${query}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getUnreadCount: async () => {
    const response = await fetch(`${API_URL}/notifications/unread-count`, { headers: getHeaders() });
    return handleResponse(response);
  },
  markAsRead: async (id) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  remove: async (id) => {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};