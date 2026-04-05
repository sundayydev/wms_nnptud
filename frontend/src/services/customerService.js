import API_URL, { handleResponse } from './api';

export const customerService = {
  getAll: async (queryParams = '') => {
    // Fallback if backend doesn't have it yet, we just mock or handle safely
    try {
      const response = await fetch(`${API_URL}/customers${queryParams}`);
      if (!response.ok) return []; // Ignore 404s for demo UI
      return handleResponse(response);
    } catch {
      return [];
    }
  }
};
