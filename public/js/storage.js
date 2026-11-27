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
  // --- SCOPED FAVORITES KEYS ---
  getFavoriteKey(type) {
    const isAdmin = this.isAdmin();
    if (type === 'cameras') {
      return isAdmin ? 'retrocam_fav_cameras_admin' : 'retrocam_fav_cameras_user';
    } else {
      return isAdmin ? 'retrocam_fav_lenses_admin' : 'retrocam_fav_lenses_user';
    }
  },

  // --- CAMERA FAVORITES ---
  getFavoriteCameras() {
    try {
      const key = this.getFavoriteKey('cameras');
      let data = localStorage.getItem(key);
      if (!data && !this.isAdmin()) {
        data = localStorage.getItem(STORAGE_KEYS.FAVORITE_CAMERAS);
        if (data) {
          localStorage.setItem(key, data);
        }
      }
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

    const key = this.getFavoriteKey('cameras');
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { type: 'camera', added, item: camera } }));
    return added;
  },

  // --- LENS FAVORITES ---
  getFavoriteLenses() {
    try {
      const key = this.getFavoriteKey('lenses');
      let data = localStorage.getItem(key);
      if (!data && !this.isAdmin()) {
        data = localStorage.getItem(STORAGE_KEYS.FAVORITE_LENSES);
        if (data) {
          localStorage.setItem(key, data);
        }
      }
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

    const key = this.getFavoriteKey('lenses');
    localStorage.setItem(key, JSON.stringify(list));
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

  // --- EDITED CAMERAS & LENSES (Admin Overrides) ---
  getEditedCameras() {
    try {
      const data = localStorage.getItem('retrocam_edited_cameras');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  updateCamera(camera) {
    try {
      const edits = this.getEditedCameras();
      edits[camera.id] = { ...(edits[camera.id] || {}), ...camera };
      localStorage.setItem('retrocam_edited_cameras', JSON.stringify(edits));

      // Juga sinkronkan jika ada di custom cameras
      const custom = this.getCustomCameras();
      const cIdx = custom.findIndex(c => c.id === camera.id);
      if (cIdx >= 0) {
        custom[cIdx] = { ...custom[cIdx], ...camera };
        localStorage.setItem('retrocam_custom_cameras', JSON.stringify(custom));
      }

      window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'camera', item: camera } }));
      return true;
    } catch (e) {
      console.error('Error updating camera:', e);
      return false;
    }
  },

  getEditedLenses() {
    try {
      const data = localStorage.getItem('retrocam_edited_lenses');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  updateLens(lens) {
    try {
      const edits = this.getEditedLenses();
      edits[lens.id] = { ...(edits[lens.id] || {}), ...lens };
      localStorage.setItem('retrocam_edited_lenses', JSON.stringify(edits));

      // Juga sinkronkan jika ada di custom lenses
      const custom = this.getCustomLenses();
      const lIdx = custom.findIndex(l => l.id === lens.id);
      if (lIdx >= 0) {
        custom[lIdx] = { ...custom[lIdx], ...lens };
        localStorage.setItem('retrocam_custom_lenses', JSON.stringify(custom));
      }

      window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'lens', item: lens } }));
      return true;
    } catch (e) {
      console.error('Error updating lens:', e);
      return false;
    }
  },

  login(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { isLoggedIn: true, user } }));
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { role: 'admin' } }));
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
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { role: 'user' } }));
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
  },

  // --- SHOPPING CART (KERANJANG BELANJA & CHECKOUT WA) ---
  getCart() {
    try {
      const data = localStorage.getItem('retrocam_cart');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart:', e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem('retrocam_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  },

  addToCart(item, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
      existing.selected = true;
    } else {
      let numPrice = 0;
      const rawPrice = item.estimatedPriceIdr || item.priceYen || '';
      const cleaned = rawPrice.replace(/[^0-9]/g, '');
      if (cleaned) numPrice = parseInt(cleaned, 10);

      cart.push({
        id: item.id,
        name: item.name,
        brand: item.brand || '',
        price: numPrice,
        priceFormatted: item.estimatedPriceIdr || item.priceYen || 'Rp 0',
        imageUrl: item.imageUrl || '/icons/icon-512.png',
        type: item.focalLength ? 'Lensa' : 'Kamera',
        quantity: qty,
        selected: true
      });
    }
    this.saveCart(cart);
    return cart;
  },

  toggleCartItemSelection(id) {
    const cart = this.getCart();
    const item = cart.find(c => c.id === id);
    if (item) {
      item.selected = item.selected === false ? true : false;
      this.saveCart(cart);
    }
    return cart;
  },

  setAllCartSelection(isSelected) {
    const cart = this.getCart();
    cart.forEach(item => {
      item.selected = !!isSelected;
    });
    this.saveCart(cart);
    return cart;
  },

  getSelectedCartItems() {
    const cart = this.getCart();
    return cart.filter(item => item.selected !== false);
  },

  getSelectedTotalCount() {
    const selected = this.getSelectedCartItems();
    return selected.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  getSelectedTotalPrice() {
    const selected = this.getSelectedCartItems();
    return selected.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  },

  updateCartQty(id, delta) {
    let cart = this.getCart();
    const item = cart.find(c => c.id === id);
    if (!item) return cart;
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(id) {
    let cart = this.getCart();
    cart = cart.filter(c => c.id !== id);
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    this.saveCart([]);
  },

  getCartTotalCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  getCartTotalPrice() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  },

  // --- CATALOG STOCK MANAGEMENT (STOK ACAK 2-5 & BERKURANG SAAT CHECKOUT) ---
  getStockMap() {
    try {
      const data = localStorage.getItem('retrocam_catalog_stocks');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveStockMap(stocks) {
    try {
      localStorage.setItem('retrocam_catalog_stocks', JSON.stringify(stocks));
      window.dispatchEvent(new CustomEvent('stockUpdated', { detail: { stocks } }));
    } catch (e) {
      console.error('Error saving stock map:', e);
    }
  },

  getProductStock(id) {
    if (!id) return 0;
    const stocks = this.getStockMap();
    if (stocks[id] !== undefined) {
      return stocks[id];
    }
    // Hasilkan stok acak awal 2 - 5 yang konsisten per ID
    const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const initialStock = (hash % 4) + 2; // nilai 2, 3, 4, atau 5
    stocks[id] = initialStock;
    this.saveStockMap(stocks);
    return initialStock;
  },

  reduceProductStock(id, qty = 1) {
    const current = this.getProductStock(id);
    const remaining = Math.max(0, current - qty);
    const stocks = this.getStockMap();
    stocks[id] = remaining;
    this.saveStockMap(stocks);
    return remaining;
  },

  isOutOfStock(id) {
    return this.getProductStock(id) <= 0;
  }
};

window.StorageService = StorageService;
