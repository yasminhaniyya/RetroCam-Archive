/**
 * RetroCam Archive - API Service Client (Modul 1 Web Service Integration)
 */

const ApiService = {
  baseUrl: '/api',

  // Fallback bundled dataset in case of complete offline before initial cache
  fallbackData: {
    cameras: [],
    lenses: [],
    guides: [],
    profile: null
  },

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.warn(`[ApiService] Network error on ${endpoint}, attempting fallback:`, error.message);
      // Let caller handle or return offline indication
      throw error;
    }
  },

  // Get cameras list with optional search and filter
  async getCameras(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.sensor && filters.sensor !== 'all') params.append('sensor', filters.sensor);
    if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
    if (filters.sort) params.append('sort', filters.sort);

    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await this.request(`/cameras${qs}`);
      return res.data || [];
    } catch (e) {
      // Fallback for static demo environments
      return this.getLocalFilteredCameras(filters);
    }
  },

  // Get camera detail by ID
  async getCameraById(id) {
    try {
      const res = await this.request(`/cameras/${id}`);
      return res.data;
    } catch (e) {
      const all = await this.getCameras();
      return all.find(c => c.id === id) || null;
    }
  },

  // Get lenses list with optional search and filter
  async getLenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.mount && filters.mount !== 'all') params.append('mount', filters.mount);
    if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
    if (filters.sort) params.append('sort', filters.sort);

    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await this.request(`/lenses${qs}`);
      return res.data || [];
    } catch (e) {
      return this.getLocalFilteredLenses(filters);
    }
  },

  // Get lens detail by ID
  async getLensById(id) {
    try {
      const res = await this.request(`/lenses/${id}`);
      return res.data;
    } catch (e) {
      const all = await this.getLenses();
      return all.find(l => l.id === id) || null;
    }
  },

  // Get guides
  async getGuides() {
    try {
      const res = await this.request('/guides');
      return res.data || [];
    } catch (e) {
      return [];
    }
  },

  async getGuideById(id) {
    try {
      const res = await this.request(`/guides/${id}`);
      return res.data;
    } catch (e) {
      const all = await this.getGuides();
      return all.find(g => g.id === id) || null;
    }
  },

  // Get profile
  async getProfile() {
    try {
      const res = await this.request('/profile');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  // Update profile on backend
  async updateProfile(profileData) {
    try {
      const res = await this.request('/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      return res.data;
    } catch (e) {
      console.warn('Backend updateProfile unreachable, saved locally in StorageService:', e);
      return null;
    }
  },

  // Get stats
  async getStats() {
    try {
      const res = await this.request('/stats');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  // Local fallbacks if backend is completely unreachable
  getLocalFilteredCameras(filters) {
    let list = window.__OFFLINE_CAMERAS_BACKUP__ || [];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q));
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter(c => (c.category || '').toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.sensor && filters.sensor !== 'all') {
      list = list.filter(c => c.sensorType.toLowerCase().includes(filters.sensor.toLowerCase()));
    }
    if (filters.brand && filters.brand !== 'all') {
      list = list.filter(c => c.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    }
    return list;
  },

  getLocalFilteredLenses(filters) {
    let list = window.__OFFLINE_LENSES_BACKUP__ || [];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.brand.toLowerCase().includes(q) ||
        l.mount.toLowerCase().includes(q) ||
        (l.category && l.category.toLowerCase().includes(q))
      );
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter(l => (l.category || '').toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.mount && filters.mount !== 'all') {
      list = list.filter(l => l.mount.toLowerCase().includes(filters.mount.toLowerCase()));
    }
    if (filters.brand && filters.brand !== 'all') {
      list = list.filter(l => l.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    }
    return list;
  }
};

window.ApiService = ApiService;
