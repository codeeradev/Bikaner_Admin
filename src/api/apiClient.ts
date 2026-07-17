interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * Transform MongoDB _id to id in response data
 */
function transformMongoResponse<T>(data: any): T {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformMongoResponse(item)) as T;
  }

  if (typeof data === "object" && data !== null) {
    const transformed: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === "_id") {
        transformed.id = value;
      } else if (key === "isActive" && !("status" in data)) {
        // Transform isActive to status for frontend
        transformed.status = value ? "active" : "inactive";
        transformed[key] = value;
      } else if (typeof value === "object" && value !== null) {
        transformed[key] = transformMongoResponse(value);
      } else {
        transformed[key] = value;
      }
    }

    return transformed as T;
  }

  return data;
}

class ApiClient {
  private baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  /**
   * Build headers with auth token if available
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const token = this.getAuthToken();
    const headers: Record<string, string> = { ...this.baseHeaders } as Record<
      string,
      string
    >;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    return `${url}?${queryString}`;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      const error: ApiError = {
        message: "An error occurred",
        status: response.status,
      };

      if (isJson) {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.errors = errorData.errors;
      } else {
        error.message = await response.text();
      }

      // Handle unauthorized
      if (response.status === 401 && !response.url.includes("/login")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }

      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (isJson) {
      const jsonData = await response.json();

      // Transform MongoDB response: extract nested data and transform _id to id
      if (jsonData && typeof jsonData === "object") {
        // Check if response has nested data structure
        if ("data" in jsonData) {
          jsonData.data = transformMongoResponse(jsonData.data);
        } else {
          // Transform entire response if no nested structure
          return transformMongoResponse<T>(jsonData);
        }
      }

      return jsonData;
    }

    return (await response.text()) as T;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    url: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers: customHeaders, ...fetchOptions } = options;
    const fullUrl = this.buildUrl(url, params);
    const headers = this.buildHeaders(customHeaders);

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        // Network error or other fetch error
        if (!("status" in error)) {
          throw {
            message: error.message || "Network error occurred",
            status: 0,
          } as ApiError;
        }
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(url, {
      method: "GET",
      params,
    });
  }

  /**
   * GET text response
   */
  async getText(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<string> {
    const response = await fetch(this.buildUrl(url, params), {
      method: "GET",
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw {
        message: await response.text(),
        status: response.status,
      } as ApiError;
    }

    return response.text();
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "body">,
  ): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "body">,
  ): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "body">,
  ): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      method: "DELETE",
      ...options,
    });
  }

  /**
   * Upload file with FormData
   */
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    method: "POST" | "PUT" = "POST",
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", async () => {
        try {
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            headers: new Headers(
              xhr
                .getAllResponseHeaders()
                .split("\r\n")
                .reduce(
                  (acc, header) => {
                    const [key, value] = header.split(": ");
                    if (key) acc[key] = value;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
            ),
          });

          const result = await this.handleResponse<T>(response);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      xhr.addEventListener("error", () => {
        reject({
          message: "Upload failed",
          status: 0,
        } as ApiError);
      });

      xhr.open(method, url);

      // Set headers
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      xhr.send(formData);
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    localStorage.removeItem("authToken");
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export standalone methods with proper typing
export const get = <T = unknown>(
  url: string,
  params?: Record<string, string | number | boolean>,
): Promise<T> => apiClient.get<T>(url, params);

export const getText = (
  url: string,
  params?: Record<string, string | number | boolean>,
): Promise<string> => apiClient.getText(url, params);

export const post = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, "body">,
): Promise<T> => apiClient.post<T>(url, data, options);

export const put = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, "body">,
): Promise<T> => apiClient.put<T>(url, data, options);

export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<RequestOptions, "body">,
): Promise<T> => apiClient.patch<T>(url, data, options);

export const del = <T = unknown>(
  url: string,
  options?: RequestOptions,
): Promise<T> => apiClient.delete<T>(url, options);

export const upload = <T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
  method?: "POST" | "PUT",
): Promise<T> => apiClient.upload<T>(url, formData, onProgress, method);

// Export the client instance for token management
export { apiClient };

// Export type for use in other files
export type { ApiError };
