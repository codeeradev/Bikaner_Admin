import { apiClient, post } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await post<LoginResponse>(ENDPOINTS.LOGIN, credentials);

    // Store the token
    if (response.token) {
      apiClient.setAuthToken(response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await post<void>(ENDPOINTS.LOGOUT);
    } finally {
      // Clear tokens and user data regardless of API response
      apiClient.removeAuthToken();
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await post<RefreshTokenResponse>(ENDPOINTS.REFRESH_TOKEN, {
      refreshToken,
    });

    // Update the stored token
    if (response.token) {
      apiClient.setAuthToken(response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
    }

    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  /**
   * Get current user from storage
   */
  getCurrentUser(): LoginResponse["user"] | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
