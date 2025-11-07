import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function ActionButton({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default",
  disabled = false,
  loading = false,
  type = "button"
}: ActionButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      variant={variant} 
      size={size}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? "Loading..." : children}
    </Button>
  );
}
