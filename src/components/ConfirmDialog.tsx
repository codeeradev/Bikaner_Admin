import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUIStore } from "@/store";

// Props interface for explicit usage
interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm?: () => void | Promise<void>;
}

// Component can be used in two ways:
// 1. With props (explicit usage in specific pages)
// 2. Without props (global dialog controlled by useUIStore)
export function ConfirmDialog({
  open: propOpen,
  onOpenChange: propOnOpenChange,
  title: propTitle,
  description: propDescription,
  onConfirm: propOnConfirm,
}: ConfirmDialogProps = {}) {
  const { dialog, hideDialog } = useUIStore();

  // If props are provided, use them; otherwise use store
  const isOpen = propOpen !== undefined ? propOpen : dialog.isOpen;
  const title = propTitle !== undefined ? propTitle : dialog.title;
  const description =
    propDescription !== undefined ? propDescription : dialog.description;
  const onConfirm =
    propOnConfirm !== undefined ? propOnConfirm : dialog.onConfirm;

  const handleOpenChange = (open: boolean) => {
    if (propOnOpenChange) {
      propOnOpenChange(open);
    } else if (!open) {
      hideDialog();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (propOnOpenChange) {
      propOnOpenChange(false);
    } else {
      hideDialog();
    }
  };

  const handleCancel = () => {
    if (propOnOpenChange) {
      propOnOpenChange(false);
    } else {
      hideDialog();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="overflow-hidden rounded-3xl border-rose-100 p-0 shadow-2xl dark:border-border">
        <div className="border-b border-rose-100/70 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-6 py-5 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="px-6 py-4">
          <AlertDialogCancel
            onClick={handleCancel}
            data-ocid="dialog.cancel_button"
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            data-ocid="dialog.confirm_button"
            className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
