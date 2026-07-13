import { ENDPOINTS } from "@/api/endpoints";
import { settingsService, staffService } from "@/api/services";
import { FormInput, FormTextarea } from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { useAuthStore, useSettingsStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Globe,
  Loader2,
  Phone,
  Settings,
  Shield,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const phoneRegex = /^\+?[\d\s-()]{7,20}$/;
const loginPhoneRegex = /^\d{10}$/;

const settingsSchema = z
  .object({
    siteTitle: z
      .string()
      .trim()
      .min(1, "Site title is required")
      .max(100, "Site title must be under 100 characters"),
    siteDescription: z
      .string()
      .trim()
      .max(500, "Description must be under 500 characters")
      .optional(),
    contactEmail: z
      .string()
      .trim()
      .min(1, "Contact email is required")
      .email("Enter a valid email"),
    contactPhone: z
      .string()
      .trim()
      .min(1, "Contact phone is required")
      .regex(phoneRegex, "Enter a valid contact phone"),
    loginPhone: z
      .string()
      .trim()
      .min(1, "Admin login mobile is required")
      .regex(loginPhoneRegex, "Admin login mobile must be 10 digits"),
    adminPassword: z
      .string()
      .optional()
      .refine((value) => !value || value.length >= 6, {
        message: "Password must be at least 6 characters",
      }),
    confirmAdminPassword: z.string().optional(),
    range: z
      .string()
      .trim()
      .min(1, "Delivery radius is required")
      .refine((value) => /^\d+$/.test(value), {
        message: "Delivery radius must be a whole number",
      })
      .refine((value) => {
        const range = Number(value);
        return range >= 100 && range <= 100000;
      }, "Use a radius between 100 and 100000 meters"),
    termsAndConditions: z.string().optional(),
    privacyPolicy: z.string().optional(),
    aboutUs: z.string().optional(),
    refundPolicy: z.string().optional(),
    shippingPolicy: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.adminPassword || data.adminPassword === data.confirmAdminPassword,
    {
      message: "Passwords do not match",
      path: ["confirmAdminPassword"],
    },
  );

type SettingsFormData = z.infer<typeof settingsSchema>;

const defaultValues: SettingsFormData = {
  siteTitle: "Bikaner Biscuit",
  siteDescription: "Complete franchise management solution",
  contactEmail: "support@bikanerbiscuit.com",
  contactPhone: "+91-9999999999",
  loginPhone: "",
  adminPassword: "",
  confirmAdminPassword: "",
  range: "5000",
  termsAndConditions: "",
  privacyPolicy: "",
  aboutUs: "",
  refundPolicy: "",
  shippingPolicy: "",
};

const apiOrigin = new URL(ENDPOINTS.GET_SETTINGS).origin;

function getAssetUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function SettingsPage() {
  const { addToast } = useUIStore();
  const { isAdmin } = usePermissions();
  const { user, setUser } = useAuthStore();
  const { setBrandSettings } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [savedLogo, setSavedLogo] = useState("");
  const [loadedValues, setLoadedValues] =
    useState<SettingsFormData>(defaultValues);

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...defaultValues,
      loginPhone: user?.phone || "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const previewUrl = useMemo(() => {
    if (logoFile) return logoPreview;
    return getAssetUrl(logoPreview);
  }, [logoFile, logoPreview]);

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await settingsService.getSettings();
        const settings = response.data;
        const nextValues: SettingsFormData = {
          siteTitle: settings.siteTitle || defaultValues.siteTitle,
          siteDescription:
            settings.siteDescription || defaultValues.siteDescription,
          contactEmail: settings.contactEmail || defaultValues.contactEmail,
          contactPhone: settings.contactPhone || defaultValues.contactPhone,
          loginPhone: user?.phone || "",
          adminPassword: "",
          confirmAdminPassword: "",
          range: String(settings.range || defaultValues.range),
          termsAndConditions: settings.termsAndConditions || "",
          privacyPolicy: settings.privacyPolicy || "",
          aboutUs: settings.aboutUs || "",
          refundPolicy: settings.refundPolicy || "",
          shippingPolicy: settings.shippingPolicy || "",
        };

        if (!isMounted) return;
        setLoadedValues(nextValues);
        setLogoFile(null);
        setSavedLogo(settings.siteLogo || "");
        setLogoPreview(settings.siteLogo || "");
        setBrandSettings({
          siteTitle: nextValues.siteTitle,
          siteLogo: settings.siteLogo || "",
        });
        reset(nextValues);
      } catch (error: any) {
        addToast({
          title: "Settings load failed",
          description: error.message || "Could not fetch settings.",
          variant: "error",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [addToast, isAdmin, reset, setBrandSettings, user?.phone]);

  useEffect(() => {
    if (!logoFile) return;

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      addToast({
        title: "Invalid logo",
        description: "Upload a PNG, JPG, or WEBP image.",
        variant: "error",
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: "Logo too large",
        description: "Logo must be smaller than 2 MB.",
        variant: "error",
      });
      return;
    }

    setLogoFile(file);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const response = await settingsService.updateSettings({
        siteTitle: data.siteTitle.trim(),
        siteDescription: data.siteDescription?.trim() || "",
        contactEmail: data.contactEmail.trim(),
        contactPhone: data.contactPhone.trim(),
        range: Number(data.range),
        termsAndConditions: data.termsAndConditions || "",
        privacyPolicy: data.privacyPolicy || "",
        aboutUs: data.aboutUs || "",
        refundPolicy: data.refundPolicy || "",
        shippingPolicy: data.shippingPolicy || "",
        ...(logoFile ? { siteLogo: logoFile } : {}),
      });

      if (user?.id) {
        const updateData: { mobile?: string; password?: string } = {};
        if (data.loginPhone.trim() !== user.phone) {
          updateData.mobile = data.loginPhone.trim();
        }
        if (data.adminPassword) {
          updateData.password = data.adminPassword;
        }

        if (Object.keys(updateData).length > 0) {
          await staffService.updateStaff(user.id, updateData);
          setUser({
            ...user,
            phone: updateData.mobile || user.phone,
          });
        }
      }

      const nextValues: SettingsFormData = {
        ...data,
        adminPassword: "",
        confirmAdminPassword: "",
      };
      setLoadedValues(nextValues);
      const nextLogo = response.data.siteLogo || savedLogo;
      setLogoFile(null);
      setSavedLogo(nextLogo);
      setLogoPreview(nextLogo);
      setBrandSettings({
        siteTitle: nextValues.siteTitle,
        siteLogo: nextLogo,
      });
      reset(nextValues);

      addToast({
        title: "Settings saved",
        description: "Site, policy, login, and delivery settings were updated.",
        variant: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Settings save failed",
        description: error.message || "Please check the fields and try again.",
        variant: "error",
      });
    }
  };

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your site preferences"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="general">
                  <Settings className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="policies">
                  <FileText className="mr-2 h-4 w-4" />
                  Policy Pages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Site Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormInput
                        name="siteTitle"
                        label="Site Title"
                        placeholder="Enter site title"
                        description="Displayed beside the logo and in the browser title"
                      />
                      <FormInput
                        name="contactEmail"
                        label="Contact Email"
                        type="email"
                        placeholder="support@example.com"
                        description="Primary contact email for the app"
                      />
                    </div>

                    <FormTextarea
                      name="siteDescription"
                      label="Site Description"
                      placeholder="Enter a brief description"
                      description="Used in app/site metadata"
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormInput
                        name="contactPhone"
                        label="Contact Phone"
                        placeholder="+91-9999999999"
                        description="Shown to app users for support"
                      />
                      <FormInput
                        name="range"
                        label="Delivery Radius (meters)"
                        type="number"
                        min={100}
                        max={100000}
                        step={1}
                        placeholder="5000"
                        description="Used by zone checker to match nearby delivery zones"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="siteLogo" className="text-sm font-medium">
                        Site Logo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Site logo preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Globe className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <input
                          id="siteLogo"
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended: 200x200px, PNG or JPG under 2 MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Admin Login
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormInput
                      name="loginPhone"
                      label="Login Mobile"
                      placeholder="9999999999"
                      description="Mobile number used by the admin to sign in"
                    />
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormInput
                        name="adminPassword"
                        label="New Password"
                        type="password"
                        placeholder="Leave blank to keep current password"
                      />
                      <FormInput
                        name="confirmAdminPassword"
                        label="Confirm New Password"
                        type="password"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policies" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Policy Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormTextarea
                      name="termsAndConditions"
                      label="Terms & Conditions"
                      placeholder="Enter your terms and conditions..."
                      rows={8}
                    />
                    <FormTextarea
                      name="privacyPolicy"
                      label="Privacy Policy"
                      placeholder="Enter your privacy policy..."
                      rows={8}
                    />
                    <FormTextarea
                      name="aboutUs"
                      label="About Us"
                      placeholder="Tell users about Bikaner Biscuit..."
                      rows={8}
                    />
                    <FormTextarea
                      name="refundPolicy"
                      label="Refund Policy"
                      placeholder="Enter your refund policy..."
                      rows={8}
                    />
                    <FormTextarea
                      name="shippingPolicy"
                      label="Shipping Policy"
                      placeholder="Enter your shipping policy..."
                      rows={8}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview(savedLogo);
                  reset(loadedValues);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
