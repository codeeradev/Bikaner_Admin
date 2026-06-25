import { FormInput } from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ProfileFormData, profileSchema } from "@/lib/validations";
import { useAuthStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Settings, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState("profile");

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = (data: ProfileFormData) => {
    if (user) {
      setUser({ ...user, ...data });
      addToast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
        variant: "success",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account settings" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" data-ocid="profile.tab.profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" data-ocid="profile.tab.security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              data-ocid="profile.tab.preferences"
            >
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          data-ocid="profile.avatar_upload"
                        >
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {user?.name || "User"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.email || "user@franchise.com"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Role: {user?.role || "Staff"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormInput
                        name="name"
                        label="Full Name"
                        placeholder="Enter your name"
                      />
                      <FormInput
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                    <FormInput
                      name="phone"
                      label="Phone Number"
                      placeholder="Enter your phone number"
                    />

                    <div className="flex justify-end">
                      <Button type="submit" data-ocid="profile.save_button">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-muted-foreground">
                      Update your account password
                    </div>
                  </div>
                  <Button variant="outline" data-ocid="profile.change_password">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Button variant="outline" data-ocid="profile.enable_2fa">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Active Sessions</div>
                    <div className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </div>
                  </div>
                  <Button variant="outline" data-ocid="profile.manage_sessions">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    data-ocid="profile.email_notifications"
                  >
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">
                      Select your preferred language
                    </div>
                  </div>
                  <Button variant="outline" data-ocid="profile.language">
                    English
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">Time Zone</div>
                    <div className="text-sm text-muted-foreground">
                      Set your local time zone
                    </div>
                  </div>
                  <Button variant="outline" data-ocid="profile.timezone">
                    UTC-5
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
