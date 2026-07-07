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
  const description = propDescription !== undefined ? propDescription : dialog.description;
  const onConfirm = propOnConfirm !== undefined ? propOnConfirm : dialog.onConfirm;
  
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            data-ocid="dialog.cancel_button"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            data-ocid="dialog.confirm_button"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
