import API_URL, { handleResponse } from './api';

export const categoryService = {
  getAll: async (queryParams = '') => {
    const response = await fetch(`${API_URL}/categories${queryParams}`);
    return handleResponse(response);
  }
};
