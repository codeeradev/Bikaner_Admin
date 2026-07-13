import { FormInput } from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProfileFormData, profileSchema } from "@/lib/validations";
import { useAuthStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, User } from "lucide-react";
import { motion } from "motion/react";
import { FormProvider, useForm } from "react-hook-form";

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
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
                    <h3 className="font-semibold">{user?.name || "User"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "user@example.com"}
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="profile.save_button">
                    Save Changes
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form className="space-y-4">
                <FormInput
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
                <FormInput
                  name="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                <FormInput
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                />
                <div className="flex justify-end">
                  <Button data-ocid="profile.change_password">
                    Update Password
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
