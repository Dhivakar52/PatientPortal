import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  confirmLabel?: string
  cancelLabel?: string
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this record?",
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent data-cy="delete-dialog" className="rounded-xl border border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-slate-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-600">
            {description} {itemName ? `"${itemName}"` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 gap-2">
          <AlertDialogCancel data-cy="delete-cancel-btn" disabled={isDeleting} className="text-xs h-9 cursor-pointer">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction 
            data-cy="delete-confirm-btn"
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}