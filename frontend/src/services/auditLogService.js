import API_URL, { handleResponse } from './api';

export const auditLogService = {
  getAll: async (queryParams = '') => {
    const response = await fetch(`${API_URL}/auditlogs${queryParams}`);
    return handleResponse(response);
  },
};
