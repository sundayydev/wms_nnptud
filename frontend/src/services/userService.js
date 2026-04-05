import API_URL, { handleResponse } from './api';

export const userService = {
  getAll: async (queryParams = '') => {
    const response = await fetch(`${API_URL}/users${queryParams}`);
    return handleResponse(response);
  }
};
