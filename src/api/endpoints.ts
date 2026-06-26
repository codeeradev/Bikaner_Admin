// Base URL for API - Update this with your actual backend URL
const BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

  import.meta.env.VITE_API_BASE_URL || "https://goutamkiapi.codeeratech.in";
export const ENDPOINTS = {
  // Authentication
  LOGIN: `${BASE_URL}/api/auth/login`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh`,
  PROFILE: `${BASE_URL}/api/auth/profile`,

  // Permissions
  GET_PERMISSIONS: `${BASE_URL}/api/permissions`,

  // Roles
  GET_ROLES: `${BASE_URL}/api/roles`,
  GET_ROLE: (id: string) => `${BASE_URL}/api/roles/${id}`,
  CREATE_ROLE: `${BASE_URL}/api/roles`,
  UPDATE_ROLE: (id: string) => `${BASE_URL}/api/roles/${id}`,
  DELETE_ROLE: (id: string) => `${BASE_URL}/api/roles/${id}`,
  TOGGLE_ROLE_STATUS: (id: string) => `${BASE_URL}/api/roles/${id}/toggle-status`,

  // Users/Staff
  GET_USERS: `${BASE_URL}/api/users`,
  GET_USER: (id: string) => `${BASE_URL}/api/users/${id}`,
  CREATE_USER: `${BASE_URL}/api/users`,
  UPDATE_USER: (id: string) => `${BASE_URL}/api/users/${id}`,
  DELETE_USER: (id: string) => `${BASE_URL}/api/users/${id}`,
  TOGGLE_USER_STATUS: (id: string) => `${BASE_URL}/api/users/${id}/toggle-status`,

  // Categories
  GET_CATEGORIES: `${BASE_URL}/api/categories`,
  GET_CATEGORY: (id: string) => `${BASE_URL}/api/categories/${id}`,
  CREATE_CATEGORY: `${BASE_URL}/api/categories`,
  UPDATE_CATEGORY: (id: string) => `${BASE_URL}/api/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `${BASE_URL}/api/categories/${id}`,

  // Products
  GET_PRODUCTS: `${BASE_URL}/api/products`,
  GET_PRODUCT: (id: string) => `${BASE_URL}/api/products/${id}`,
  CREATE_PRODUCT: `${BASE_URL}/api/products`,
  UPDATE_PRODUCT: (id: string) => `${BASE_URL}/api/products/${id}`,
  DELETE_PRODUCT: (id: string) => `${BASE_URL}/api/products/${id}`,

  // Zones
  GET_ZONES: `${BASE_URL}/api/zones`,
  GET_ZONE: (id: string) => `${BASE_URL}/api/zones/${id}`,
  CREATE_ZONE: `${BASE_URL}/api/zones`,
  UPDATE_ZONE: (id: string) => `${BASE_URL}/api/zones/${id}`,
  DELETE_ZONE: (id: string) => `${BASE_URL}/api/zones/${id}`,

  // Cities
  GET_CITIES: `${BASE_URL}/api/cities`,
  GET_CITY: (id: string) => `${BASE_URL}/api/cities/${id}`,
  CREATE_CITY: `${BASE_URL}/api/cities`,
  UPDATE_CITY: (id: string) => `${BASE_URL}/api/cities/${id}`,
  DELETE_CITY: (id: string) => `${BASE_URL}/api/cities/${id}`,

  // Orders
  GET_ORDERS: `${BASE_URL}/api/orders`,
  GET_ORDER: (id: string) => `${BASE_URL}/api/orders/${id}`,
  CREATE_ORDER: `${BASE_URL}/api/orders`,
  UPDATE_ORDER: (id: string) => `${BASE_URL}/api/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `${BASE_URL}/api/orders/${id}/status`,

  // Normal Orders
  GET_NORMAL_ORDERS: `${BASE_URL}/api/orders/normal`,
  GET_NORMAL_ORDER: (id: string) => `${BASE_URL}/api/orders/normal/${id}`,

  // Bulk Orders
  GET_BULK_ORDERS: `${BASE_URL}/api/orders/bulk`,
  GET_BULK_ORDER: (id: string) => `${BASE_URL}/api/orders/bulk/${id}`,

  // Franchise
  GET_FRANCHISES: `${BASE_URL}/api/franchises`,
  GET_FRANCHISE: (id: string) => `${BASE_URL}/api/franchises/${id}`,
  CREATE_FRANCHISE: `${BASE_URL}/api/franchises`,
  UPDATE_FRANCHISE: (id: string) => `${BASE_URL}/api/franchises/${id}`,
  DELETE_FRANCHISE: (id: string) => `${BASE_URL}/api/franchises/${id}`,

  // Franchise Requests
  GET_FRANCHISE_REQUESTS: `${BASE_URL}/api/franchise-requests`,
  GET_FRANCHISE_REQUEST: (id: string) => `${BASE_URL}/api/franchise-requests/${id}`,
  APPROVE_FRANCHISE_REQUEST: (id: string) =>
    `${BASE_URL}/api/franchise-requests/${id}/approve`,
  REJECT_FRANCHISE_REQUEST: (id: string) =>
    `${BASE_URL}/api/franchise-requests/${id}/reject`,

  // Registered Franchises
  GET_REGISTERED_FRANCHISES: `${BASE_URL}/api/franchises/registered`,
  GET_REGISTERED_FRANCHISE: (id: string) =>
    `${BASE_URL}/api/franchises/registered/${id}`,

  // Wallet
  GET_WALLET: `${BASE_URL}/api/wallet`,
  GET_WALLET_TRANSACTIONS: `${BASE_URL}/api/wallet/transactions`,
  ADD_WALLET_BALANCE: `${BASE_URL}/api/wallet/add-balance`,
  WITHDRAW_WALLET_BALANCE: `${BASE_URL}/api/wallet/withdraw`,

  // Dashboard
  GET_DASHBOARD_STATS: `${BASE_URL}/api/dashboard/stats`,
  GET_DASHBOARD_CHARTS: `${BASE_URL}/api/dashboard/charts`,

  // Theme
  GET_THEME: `${BASE_URL}/api/theme`,
  UPDATE_THEME: `${BASE_URL}/api/theme`,

  // Profile
  GET_PROFILE: `${BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${BASE_URL}/api/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/api/profile/change-password`,

  // Settings
  GET_SETTINGS: `${BASE_URL}/api/settings`,
  UPDATE_SETTINGS: `${BASE_URL}/api/settings`,
} as const;
