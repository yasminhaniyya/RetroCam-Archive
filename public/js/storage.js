/**
 * RetroCam Archive - LocalStorage & State Management
 */

const STORAGE_KEYS = {
  FAVORITE_CAMERAS: 'retrocam_fav_cameras',
  FAVORITE_LENSES: 'retrocam_fav_lenses',
  USER_PROFILE: 'retrocam_user_profile',
  STUDENT_PROFILE: 'retrocam_student_profile',
  AUTH_USER: 'retrocam_auth_user'
};

const StorageService = {
  // --- CAMERA FAVORITES ---
  getFavoriteCameras() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_CAMERAS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading favorite cameras:', e);
      return [];
    }
  },

  isCameraFavorite(id) {
    const list = this.getFavoriteCameras();
    return list.some(item => item.id === id);
  },

  toggleFavoriteCamera(camera) {
    let list = this.getFavoriteCameras();
    const index = list.findIndex(item => item.id === camera.id);
    let added = false;

    if (index >= 0) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(camera);
      added = true;
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITE_CAMERAS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { type: 'camera', added, item: camera } }));
    return added;
  },

  // --- LENS FAVORITES ---
  getFavoriteLenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_LENSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading favorite lenses:', e);
      return [];
    }
  },

  isLensFavorite(id) {
    const list = this.getFavoriteLenses();
    return list.some(item => item.id === id);
  },

  toggleFavoriteLens(lens) {
    let list = this.getFavoriteLenses();
    const index = list.findIndex(item => item.id === lens.id);
    let added = false;

    if (index >= 0) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(lens);
      added = true;
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITE_LENSES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { type: 'lens', added, item: lens } }));
    return added;
  },

  getTotalFavoritesCount() {
    return this.getFavoriteCameras().length + this.getFavoriteLenses().length;
  },

  // --- AUTHENTICATION (ECOMMERCE LOGIN) ---
  getAuthUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getAuthUser();
  },

  isAdmin() {
    const user = this.getAuthUser();
    return !!(user && (user.role === 'admin' || user.email === 'admin@retrocam.id'));
  },

  // --- CUSTOM ADMIN ADDED CAMERAS & LENSES (Offline Persistence) ---
  getCustomCameras() {
    try {
      const data = localStorage.getItem('retrocam_custom_cameras');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addCustomCamera(camera) {
    try {
      const list = this.getCustomCameras();
      list.unshift(camera);
      localStorage.setItem('retrocam_custom_cameras', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'camera', item: camera } }));
    } catch (e) {
      console.error('Error saving custom camera:', e);
    }
  },

  getCustomLenses() {
    try {
      const data = localStorage.getItem('retrocam_custom_lenses');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addCustomLens(lens) {
    try {
      const list = this.getCustomLenses();
      list.unshift(lens);
      localStorage.setItem('retrocam_custom_lenses', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'lens', item: lens } }));
    } catch (e) {
      console.error('Error saving custom lens:', e);
    }
  },

  login(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { isLoggedIn: true, user } }));
      return true;
    } catch (e) {
      console.error('Error logging in:', e);
      return false;
    }
  },

  logout() {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { isLoggedIn: false } }));
      return true;
    } catch (e) {
      console.error('Error logging out:', e);
      return false;
    }
  },

  // --- USER PROFILE OVERRIDE ---
  getSavedProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCustomProfile(profileData) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData));
      localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profileData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profileData }));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  clearSavedProfile() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILE);
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: null }));
    } catch (e) {
      console.error('Error clearing profile:', e);
    }
  }
};

window.StorageService = StorageService;
