import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-gray-800">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
