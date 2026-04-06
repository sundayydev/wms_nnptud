import API_URL, { handleResponse } from './api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const userService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        return handleResponse(response);
    },
    create: async (data) => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    update: async (id, data) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

export const roleService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/roles`, { headers: getHeaders() });
        return handleResponse(response);
    }
};
