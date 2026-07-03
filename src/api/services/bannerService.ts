import { del, get, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface Banner {
  id: string;
  title: string;
  image: string;
  productId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    _id: string;
    name: string;
  };
}

export interface CreateBannerDto {
  title: string;
  image: File;
  productId?: string;
  isActive?: boolean;
}

export interface UpdateBannerDto {
  title?: string;
  image?: File;
  productId?: string;
  isActive?: boolean;
}

export interface BannerListResponse {
  success: boolean;
  data: Banner[];
  message?: string;
}

export const bannerService = {
  /**
   * Get all banners
   */
  async getBanners(): Promise<BannerListResponse> {
    console.log("🔵 Fetching banners");
    console.log("🔵 Endpoint:", ENDPOINTS.BANNERS_GET);

    try {
      const response = await get<BannerListResponse>(ENDPOINTS.BANNERS_GET);
      console.log("✅ Banners fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch banners:", error);
      throw error;
    }
  },

  /**
   * Create a new banner
   */
  async createBanner(data: CreateBannerDto): Promise<Banner> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("image", data.image);

      if (data.productId) {
        formData.append("productId", data.productId);
      }

      formData.append("isActive", (data.isActive ?? true).toString());

      const response = await upload<{ success: boolean; data: Banner; message: string }>(
        ENDPOINTS.BANNERS_CREATE,
        formData
      );
      console.log("✅ Banner created successfully:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create banner:", error);
      throw error;
    }
  },

  /**
   * Update an existing banner
   */
  async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
    console.log("🔵 Updating banner:", id, "with data:", data);
    console.log("🔵 Endpoint:", ENDPOINTS.BANNERS_UPDATE(id));

    try {
      const formData = new FormData();

      if (data.title) {
        formData.append("title", data.title);
      }

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (data.productId !== undefined) {
        formData.append("productId", data.productId);
      }

      if (data.isActive !== undefined) {
        formData.append("isActive", data.isActive.toString());
      }

      const response = await upload<{ updatedBanner: Banner }>(
        ENDPOINTS.BANNERS_UPDATE(id),
        formData,
        undefined,
        "PUT"
      );
      console.log("✅ Banner updated successfully:", response);
      return response.updatedBanner;
    } catch (error) {
      console.error("❌ Failed to update banner:", error);
      throw error;
    }
  },

  /**
   * Delete a banner
   */
  async deleteBanner(id: string): Promise<void> {
    console.log("🔵 Deleting banner:", id);
    console.log("🔵 Endpoint:", ENDPOINTS.BANNERS_DELETE(id));

    try {
      await del<void>(ENDPOINTS.BANNERS_DELETE(id));
      console.log("✅ Banner deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete banner:", error);
      throw error;
    }
  },
};
