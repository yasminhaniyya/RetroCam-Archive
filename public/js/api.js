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
    let results = [];
    try {
      const res = await this.request(`/cameras${qs}`);
      results = res.data || [];
    } catch (e) {
      // Fallback for static demo environments
      results = this.getLocalFilteredCameras(filters);
    }

    // Merge custom cameras added locally if not already present
    const custom = StorageService.getCustomCameras ? StorageService.getCustomCameras() : [];
    if (custom.length > 0) {
      const existingIds = new Set(results.map(c => c.id));
      const toAdd = custom.filter(c => !existingIds.has(c.id));
      results = [...toAdd, ...results];
    }

    // Apply edited cameras overrides (Admin edits)
    const edited = StorageService.getEditedCameras ? StorageService.getEditedCameras() : {};
    results = results.map(c => edited[c.id] ? { ...c, ...edited[c.id] } : c);

    return results;
  },

  // Get camera detail by ID
  async getCameraById(id) {
    const edited = StorageService.getEditedCameras ? StorageService.getEditedCameras() : {};
    if (edited[id]) {
      return edited[id];
    }
    try {
      const res = await this.request(`/cameras/${id}`);
      return res.data;
    } catch (e) {
      const all = await this.getCameras();
      return all.find(c => c.id === id) || null;
    }
  },

  // Update existing camera (Admin)
  async updateCamera(camera) {
    StorageService.updateCamera(camera);
    try {
      return await this.request(`/cameras/${camera.id}`, {
        method: 'PUT',
        body: JSON.stringify(camera)
      });
    } catch (e) {
      console.warn('[ApiService] Backend PUT /cameras error (normal offline):', e.message);
      return { status: 'success', data: camera };
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
    let results = [];
    try {
      const res = await this.request(`/lenses${qs}`);
      results = res.data || [];
    } catch (e) {
      results = this.getLocalFilteredLenses(filters);
    }

    // Merge custom lenses added locally if not already present
    const custom = StorageService.getCustomLenses ? StorageService.getCustomLenses() : [];
    if (custom.length > 0) {
      const existingIds = new Set(results.map(l => l.id));
      const toAdd = custom.filter(l => !existingIds.has(l.id));
      results = [...toAdd, ...results];
    }

    // Apply edited lenses overrides (Admin edits)
    const edited = StorageService.getEditedLenses ? StorageService.getEditedLenses() : {};
    results = results.map(l => edited[l.id] ? { ...l, ...edited[l.id] } : l);

    return results;
  },

  // Get lens detail by ID
  async getLensById(id) {
    const edited = StorageService.getEditedLenses ? StorageService.getEditedLenses() : {};
    if (edited[id]) {
      return edited[id];
    }
    try {
      const res = await this.request(`/lenses/${id}`);
      return res.data;
    } catch (e) {
      const all = await this.getLenses();
      return all.find(l => l.id === id) || null;
    }
  },

  // Update existing lens (Admin)
  async updateLens(lens) {
    StorageService.updateLens(lens);
    try {
      return await this.request(`/lenses/${lens.id}`, {
        method: 'PUT',
        body: JSON.stringify(lens)
      });
    } catch (e) {
      console.warn('[ApiService] Backend PUT /lenses error (normal offline):', e.message);
      return { status: 'success', data: lens };
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

  // Add new camera (Admin)
  async addCamera(cameraData) {
    try {
      const res = await this.request('/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cameraData)
      });
      StorageService.addCustomCamera(res.data || cameraData);
      return res.data || cameraData;
    } catch (e) {
      console.warn('Backend addCamera unreachable, saving locally in StorageService:', e);
      StorageService.addCustomCamera(cameraData);
      return cameraData;
    }
  },

  // Add new lens (Admin)
  async addLens(lensData) {
    try {
      const res = await this.request('/lenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lensData)
      });
      StorageService.addCustomLens(res.data || lensData);
      return res.data || lensData;
    } catch (e) {
      console.warn('Backend addLens unreachable, saving locally in StorageService:', e);
      StorageService.addCustomLens(lensData);
      return lensData;
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
