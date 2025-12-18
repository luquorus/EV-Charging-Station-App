const API_BASE_URL = '/api/v1';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.error?.message || error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth APIs
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const data = await this.request('/auth/refresh', {
      method: 'POST',
    });
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    return data;
  }

  // Stations APIs
  async getStations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stations${query ? `?${query}` : ''}`);
  }

  async getStationById(id) {
    return this.request(`/stations/${id}`);
  }

  async createStation(station) {
    return this.request('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    });
  }

  async updateStation(id, station) {
    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(station),
    });
  }

  async deleteStation(id) {
    return this.request(`/stations/${id}`, {
      method: 'DELETE',
    });
  }

  async importStationsCSV(formData) {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/stations/import-csv`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.error?.message || error.message || 'Request failed');
    }

    return response.json();
  }

  // Users APIs
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(user) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id, user) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

