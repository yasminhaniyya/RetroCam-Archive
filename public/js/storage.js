/**
 * RetroCam Archive - LocalStorage & State Management
 */

const STORAGE_KEYS = {
  FAVORITE_CAMERAS: 'retrocam_fav_cameras',
  FAVORITE_LENSES: 'retrocam_fav_lenses',
  STUDENT_PROFILE: 'retrocam_student_profile'
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

  // --- CUSTOM STUDENT PROFILE OVERRIDE ---
  getSavedProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCustomProfile(profileData) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profileData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profileData }));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  }
};

window.StorageService = StorageService;
