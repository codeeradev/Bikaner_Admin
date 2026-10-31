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
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
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
      email: "",
      password: "",
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
        setError(
          result.error ||
            "Invalid mobile or password. Try 9999999999 / admin123",
        );
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      setIsSubmitting(false);
      setError(
        `An error occurred during login: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 p-4 dark:from-slate-950 dark:via-rose-950/20 dark:to-amber-950/30 sm:p-8">
      <div className="pointer-events-none absolute -left-24 -top-28 -z-10 h-80 w-80 rounded-full bg-rose-200/55 blur-3xl dark:bg-rose-700/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 -z-10 h-96 w-96 rounded-full bg-amber-300/45 blur-3xl dark:bg-amber-700/10" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/75 bg-white/75 shadow-2xl shadow-rose-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-card/90 lg:min-h-[610px] lg:grid-cols-[1.05fr_0.95fr]"
      >
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-amber-200/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white p-1.5 shadow-lg">
              <img src="/assets/images/bikaner-logo.jpeg" alt="Bikaner Biscuit Bakery" className="h-full w-full rounded-xl object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Bikaner Admin</p>
              <p className="text-sm text-white/80">Bakery operations</p>
            </div>
          </div>
          <div className="relative max-w-md py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> Made fresh, managed with care
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight xl:text-5xl">
              Welcome back to your bakery.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/85">
              Keep orders, products, inventory, and store activity running smoothly from one place.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4" /> Secure access for your team
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10 lg:p-12">
          <Card className="w-full max-w-md gap-0 rounded-3xl border-0 bg-transparent py-0 shadow-none">
            <CardHeader className="space-y-5 px-0 pb-7 text-left">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-100 bg-white p-1.5 shadow-sm">
                  <img src="/assets/images/bikaner-logo.jpeg" alt="Bikaner Biscuit Bakery" className="h-full w-full rounded-xl object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bikaner Admin</p>
                  <p className="text-xs text-muted-foreground">Bakery operations</p>
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Sign in</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Enter your account details to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0">
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/30"
              >
                <AlertDescription className="font-medium text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Mobile Number</Label>
                <Input
                  id="email"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  {...register("email")}
                  className={`h-12 rounded-xl bg-white/80 px-4 dark:bg-background/60 ${errors.email ? "border-destructive" : "border-rose-100 focus-visible:border-orange-400"}`}
                  data-ocid="login.mobile_input"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
                {!errors.email && (
                  <p className="text-xs text-muted-foreground">
                    Use your 10-digit mobile number
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`h-12 rounded-xl bg-white/80 px-4 pr-11 dark:bg-background/60 ${errors.password ? "border-destructive" : "border-rose-100 focus-visible:border-orange-400"}`}
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
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
                {/* <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-ocid="login.forgot_password"
                >
                  Forgot password?
                </button> */}
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-105"
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
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </main>
  );
}
