import API_URL, { handleResponse } from './api';

export const salesOrderService = {
  getAll: async (queryParams = '') => {
    const response = await fetch(`${API_URL}/sales-orders${queryParams}`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/sales-orders/${id}`);
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/sales-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/sales-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/sales-orders/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};
