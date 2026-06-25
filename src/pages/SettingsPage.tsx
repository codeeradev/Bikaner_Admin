import { FormInput, FormTextarea } from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SettingsFormData, settingsSchema } from "@/lib/validations";
import { useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Mail, Phone, Settings } from "lucide-react";
import { motion } from "motion/react";
import { FormProvider, useForm } from "react-hook-form";

export function SettingsPage() {
  const { addToast } = useUIStore();

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "Franchise Admin",
      siteDescription: "Complete franchise management solution",
      contactEmail: "support@franchise.com",
      contactPhone: "+1-555-0199",
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = (_data: SettingsFormData) => {
    addToast({
      title: "Settings saved",
      description: "Site settings have been updated successfully.",
      variant: "success",
    });
  };

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Site Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormInput
                    name="siteName"
                    label="Site Name"
                    placeholder="Enter site name"
                    description="This will be displayed in the browser title and header"
                  />
                  <FormInput
                    name="contactEmail"
                    label="Contact Email"
                    type="email"
                    placeholder="support@franchise.com"
                    description="Primary contact email for the platform"
                  />
                </div>

                <FormTextarea
                  name="siteDescription"
                  label="Site Description"
                  placeholder="Enter a brief description of your platform"
                  description="This description may be used in meta tags and SEO"
                />

                <FormInput
                  name="contactPhone"
                  label="Contact Phone"
                  placeholder="+1-555-0199"
                  description="Primary contact phone number"
                />

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Site URL</div>
                    <div className="text-sm text-muted-foreground">
                      https://franchise-admin.example.com
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="settings.save_button">
                    Save Settings
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
