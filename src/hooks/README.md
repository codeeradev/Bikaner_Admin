# Alert System

A centralized alert system for displaying notifications throughout the application.

## Usage

### Basic Usage

```tsx
import { useAlert } from "@/hooks/use-alert";

function MyComponent() {
  const alert = useAlert();

  const handleSuccess = () => {
    alert.success("Operation completed successfully!");
  };

  const handleError = () => {
    alert.error("Something went wrong!");
  };

  const handleLoading = () => {
    const loadingId = alert.loading("Processing...");
    
    // When done, remove the loading alert
    setTimeout(() => {
      alert.removeAlert(loadingId);
      alert.success("Done!");
    }, 2000);
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleLoading}>Show Loading</button>
    </div>
  );
}
```

### Alternative Syntax

```tsx
// These are equivalent
alert.success("Success message");
alert.setAlert("success", "Success message");

alert.error("Error message");
alert.setAlert("error", "Error message");

alert.loading("Loading message");
alert.setAlert("loading", "Loading message");

alert.info("Info message");
alert.setAlert("info", "Info message");

alert.warning("Warning message");
alert.setAlert("warning", "Warning message");
```

### Custom Duration

By default, alerts auto-dismiss after 5 seconds (except loading alerts). You can customize this:

```tsx
// Show for 10 seconds
alert.success("This will stay for 10 seconds", 10000);

// Show for 3 seconds
alert.error("Quick error message", 3000);

// Loading alerts never auto-dismiss (duration is ignored)
alert.loading("Loading..."); // Stays until manually removed
```

### Managing Alerts

```tsx
const alert = useAlert();

// Get the alert ID for manual removal
const id = alert.loading("Processing...");

// Remove specific alert
alert.removeAlert(id);

// Clear all alerts
alert.clearAlerts();
```

## Alert Types

- `success` - Green checkmark, auto-dismisses
- `error` - Red X, auto-dismisses
- `loading` - Spinning loader, stays until manually removed
- `info` - Blue info icon, auto-dismisses
- `warning` - Yellow warning icon, auto-dismisses

## Complete Example

```tsx
import { useAlert } from "@/hooks/use-alert";

function DataForm() {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingId = alert.loading("Saving data...");
    
    try {
      await api.saveData(data);
      alert.removeAlert(loadingId);
      alert.success("Data saved successfully!");
    } catch (error) {
      alert.removeAlert(loadingId);
      alert.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Notes

- Alerts are displayed in a fixed container at the top-right of the screen
- Multiple alerts can be shown simultaneously
- Users can manually dismiss alerts by clicking the X button (except loading alerts)
- The AlertContainer component is already added to the root router, so alerts work globally
