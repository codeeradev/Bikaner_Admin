// Simple toast hook - shows browser notifications
export function useToast() {
  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => {
    const message = description ? `${title}: ${description}` : title;

    // Log to console
    if (variant === "destructive") {
      console.error("🔴 ERROR:", message);
    } else {
      console.log("🟢 SUCCESS:", message);
    }

    // Show visual alert
    if (variant === "destructive") {
      alert(`❌ ${message}`);
    } else {
      // Use a timeout to avoid blocking
      setTimeout(() => {
        console.log("✅", message);
        // You can replace this with a proper toast library later
      }, 0);
    }
  };

  return { toast };
}
