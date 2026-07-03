// Base URL for API - Update this with your actual backend URL
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

  // import.meta.env.VITE_API_BASE_URL || "https://bikanerapi.codeeratech.in";
export const ENDPOINTS = {
  // Authentication
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
  PROFILE: `${BASE_URL}/auth/profile`,

  // Permissions
  GET_PERMISSIONS: `${BASE_URL}/permissions`,

  // Roles
  GET_ROLES: `${BASE_URL}/roles`,
  GET_ROLE: (id: string) => `${BASE_URL}/roles/${id}`,
  CREATE_ROLE: `${BASE_URL}/roles`,
  UPDATE_ROLE: (id: string) => `${BASE_URL}/roles/${id}`,
  DELETE_ROLE: (id: string) => `${BASE_URL}/roles/${id}`,
  TOGGLE_ROLE_STATUS: (id: string) => `${BASE_URL}/roles/${id}/toggle-status`,

  // Users/Staff
  GET_USERS: `${BASE_URL}/users`,
  GET_USER: (id: string) => `${BASE_URL}/users/${id}`,
  CREATE_USER: `${BASE_URL}/users`,
  UPDATE_USER: (id: string) => `${BASE_URL}/users/${id}`,
  DELETE_USER: (id: string) => `${BASE_URL}/users/${id}`,
  TOGGLE_USER_STATUS: (id: string) => `${BASE_URL}/users/${id}/toggle-status`,

  // Categories
  GET_CATEGORIES: `${BASE_URL}/categories`,
  GET_CATEGORY: (id: string) => `${BASE_URL}/categories/${id}`,
  CREATE_CATEGORY: `${BASE_URL}/categories`,
  UPDATE_CATEGORY: (id: string) => `${BASE_URL}/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `${BASE_URL}/categories/${id}`,

  // Products
  GET_PRODUCTS: `${BASE_URL}/products`,
  GET_PRODUCT: (id: string) => `${BASE_URL}/products/${id}`,
  CREATE_PRODUCT: `${BASE_URL}/products`,
  UPDATE_PRODUCT: (id: string) => `${BASE_URL}/products/${id}`,
  DELETE_PRODUCT: (id: string) => `${BASE_URL}/products/${id}`,

  // Zones
  GET_ZONES: `${BASE_URL}/zones`,
  GET_ZONE: (id: string) => `${BASE_URL}/zones/${id}`,
  CREATE_ZONE: `${BASE_URL}/zones`,
  UPDATE_ZONE: (id: string) => `${BASE_URL}/zones/${id}`,
  DELETE_ZONE: (id: string) => `${BASE_URL}/zones/${id}`,

  // Cities
  GET_CITIES: `${BASE_URL}/cities`,
  GET_CITY: (id: string) => `${BASE_URL}/cities/${id}`,
  CREATE_CITY: `${BASE_URL}/cities`,
  UPDATE_CITY: (id: string) => `${BASE_URL}/cities/${id}`,
  DELETE_CITY: (id: string) => `${BASE_URL}/cities/${id}`,

  // Orders
  GET_ORDERS: `${BASE_URL}/orders`,
  GET_ORDER: (id: string) => `${BASE_URL}/orders/${id}`,
  CREATE_ORDER: `${BASE_URL}/orders`,
  UPDATE_ORDER: (id: string) => `${BASE_URL}/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `${BASE_URL}/orders/${id}/status`,

  // Normal Orders
  GET_NORMAL_ORDERS: `${BASE_URL}/orders/normal`,
  GET_NORMAL_ORDER: (id: string) => `${BASE_URL}/orders/normal/${id}`,

  // Bulk Orders
  GET_BULK_ORDERS: `${BASE_URL}/orders/bulk`,
  GET_BULK_ORDER: (id: string) => `${BASE_URL}/orders/bulk/${id}`,

  // Franchise
  GET_FRANCHISES: `${BASE_URL}/franchises`,
  GET_FRANCHISE: (id: string) => `${BASE_URL}/franchises/${id}`,
  CREATE_FRANCHISE: `${BASE_URL}/franchises`,
  UPDATE_FRANCHISE: (id: string) => `${BASE_URL}/franchises/${id}`,
  DELETE_FRANCHISE: (id: string) => `${BASE_URL}/franchises/${id}`,

  // Franchise Requests
  GET_FRANCHISE_REQUESTS: `${BASE_URL}/franchise-requests`,
  GET_FRANCHISE_REQUEST: (id: string) => `${BASE_URL}/franchise-requests/${id}`,
  APPROVE_FRANCHISE_REQUEST: (id: string) =>
    `${BASE_URL}/franchise-requests/${id}/approve`,
  REJECT_FRANCHISE_REQUEST: (id: string) =>
    `${BASE_URL}/franchise-requests/${id}/reject`,

  // Registered Franchises
  GET_REGISTERED_FRANCHISES: `${BASE_URL}/franchises/registered`,
  GET_REGISTERED_FRANCHISE: (id: string) =>
    `${BASE_URL}/franchises/registered/${id}`,

  // Wallet
  GET_WALLET: `${BASE_URL}/wallet`,
  GET_WALLET_TRANSACTIONS: `${BASE_URL}/wallet/transactions`,
  ADD_WALLET_BALANCE: `${BASE_URL}/wallet/add-balance`,
  WITHDRAW_WALLET_BALANCE: `${BASE_URL}/wallet/withdraw`,

  // Dashboard
  GET_DASHBOARD_STATS: `${BASE_URL}/dashboard/stats`,
  GET_DASHBOARD_CHARTS: `${BASE_URL}/dashboard/charts`,

  // Theme
  GET_THEME: `${BASE_URL}/theme`,
  UPDATE_THEME: `${BASE_URL}/theme`,

  // Profile
  GET_PROFILE: `${BASE_URL}/profile`,
  UPDATE_PROFILE: `${BASE_URL}/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/profile/change-password`,

  // Settings
  GET_SETTINGS: `${BASE_URL}/settings`,
  UPDATE_SETTINGS: `${BASE_URL}/settings`,
} as const;
