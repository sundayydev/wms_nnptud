const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  return data;
};

export default API_URL;
