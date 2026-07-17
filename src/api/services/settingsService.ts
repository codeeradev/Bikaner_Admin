import { get, put, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface SettingsData {
  id?: string;
  siteTitle: string;
  siteLogo?: string;
  siteDescription?: string;
  contactEmail: string;
  contactPhone: string;
  range?: number;
  termsAndConditions?: string;
  privacyPolicy?: string;
  aboutUs?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  globalDeliveryCharges?: number;
  platformFee?: number;
  globalTax?: number;
}

export type UpdateSettingsDto = Partial<
  Omit<SettingsData, "id" | "siteLogo">
> & {
  siteLogo?: string | File;
};

interface SettingsResponse {
  success: boolean;
  message?: string;
  data: SettingsData;
}

export const settingsService = {
  async getSettings(): Promise<SettingsResponse> {
    return get<SettingsResponse>(ENDPOINTS.GET_SETTINGS);
  },

  async updateSettings(data: UpdateSettingsDto): Promise<SettingsResponse> {
    if (data.siteLogo instanceof File) {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;

        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }

      return upload<SettingsResponse>(
        ENDPOINTS.UPDATE_SETTINGS,
        formData,
        undefined,
        "PUT",
      );
    }

    return put<SettingsResponse>(ENDPOINTS.UPDATE_SETTINGS, data);
  },
};
