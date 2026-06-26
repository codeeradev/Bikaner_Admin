import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginFormData, loginSchema } from "@/lib/validations";
import { useAuthStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "9999999999",
      password: "admin123",
      rememberMe: false,
    },
  });

  // Log validation errors when they occur
  if (Object.keys(errors).length > 0) {
    console.log("⚠️ Validation errors:", errors);
  }

  const onSubmit = async (data: LoginFormData) => {
    console.log("🔐 Login form submitted with data:", { mobile: data.email });
    setError("");
    setIsSubmitting(true);
    
    try {
      console.log("📞 Calling login function...");
      const result = await login(
        data.email, // This will be used as mobile
        data.password,
        data.rememberMe || false,
      );
      
      console.log("📦 Login result:", result);
      setIsSubmitting(false);
      
      if (result.success) {
        console.log("✅ Login successful, navigating to dashboard...");
        navigate({ to: "/dashboard" });
      } else {
        console.error("❌ Login failed:", result.error);
        setError(result.error || "Invalid mobile or password. Try 9999999999 / admin123");
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      setIsSubmitting(false);
      setError(`An error occurred during login: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-elevated">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Franchise Admin
              </CardTitle>
              <CardDescription className="mt-1">
                Sign in to your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Mobile Number</Label>
                <Input
                  id="email"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  data-ocid="login.mobile_input"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
                {!errors.email && (
                  <p className="text-xs text-muted-foreground">
                    Use your 10-digit mobile number (e.g., 9999999999)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-ocid="login.show_password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" {...register("rememberMe")} />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-ocid="login.forgot_password"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-ocid="login.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Demo credentials: 9999999999 / admin123
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
