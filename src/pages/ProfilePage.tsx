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
      <PageHeader
        title="Profile"
        description="Manage your account details and sign-in preferences."
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden rounded-3xl border-rose-100/80 bg-card/90 shadow-sm dark:border-border">
            <CardHeader className="border-b border-rose-100/70 bg-gradient-to-r from-rose-50/80 to-orange-50/60 dark:border-border dark:from-rose-950/10 dark:to-orange-950/5">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-2xl border border-rose-100/70 bg-gradient-to-r from-rose-50/60 to-amber-50/50 p-4 dark:border-border dark:from-rose-950/10 dark:to-card sm:flex-row sm:items-center sm:gap-5">
                    <div className="relative">
                      <Avatar className="h-20 w-20 ring-4 ring-white shadow-md dark:ring-card">
                        <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-500 text-2xl font-bold text-white">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm transition hover:brightness-105"
                        data-ocid="profile.avatar_upload"
                      >
                        <Camera className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {user?.name || "User"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: {user?.role || "Staff"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
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

                  <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      data-ocid="profile.save_button"
                      className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-rose-100/80 bg-card/90 shadow-sm dark:border-border">
            <CardHeader className="border-b border-rose-100/70 bg-gradient-to-r from-rose-50/80 to-orange-50/60 dark:border-border dark:from-rose-950/10 dark:to-orange-950/5">
              <CardTitle className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                  <Camera className="h-4 w-4" />
                </span>
                Change Password
              </CardTitle>
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
                  <div className="flex justify-end border-t border-border/70 pt-4">
                    <Button
                      data-ocid="profile.change_password"
                      className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
