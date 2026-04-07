import API_URL, { handleResponse } from './api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const messageService = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getConversation: async (userId) => {
    const response = await fetch(`${API_URL}/messages/${userId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  sendMessage: async (data) => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};