import { apiClient, post } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    mobile: string;
    profileImage?: string;
    role: string;
    roleId: string;
    permissions: string[];
    status: string;
  };
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("🌐 AuthService: Starting login request...");
    console.log("🌐 AuthService: Endpoint:", ENDPOINTS.LOGIN);
    console.log("🌐 AuthService: Credentials:", { mobile: credentials.mobile });
    
    try {
      const response = await post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
      console.log("🌐 AuthService: Response received:", { success: response.success, hasToken: !!response.token });

      // Store the token
      if (response.token) {
        console.log("🌐 AuthService: Storing token and user data...");
        apiClient.setAuthToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        console.log("🌐 AuthService: Token stored successfully");
      }

      return response;
    } catch (error) {
      console.error("🌐 AuthService: Login error:", error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await post<void>(ENDPOINTS.LOGOUT);
    } finally {
      // Clear token and user data regardless of API response
      apiClient.removeAuthToken();
      localStorage.removeItem("user");
    }
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
