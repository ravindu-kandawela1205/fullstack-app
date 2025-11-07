import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type IconButtonProps = {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
};

export default function IconButton({ 
  icon, 
  onClick, 
  label, 
  variant = "default", 
  size = "default",
  disabled = false 
}: IconButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      variant={variant} 
      size={size}
      disabled={disabled}
      className={label ? "inline-flex items-center gap-2" : ""}
    >
      {icon}
      {label && <span>{label}</span>}
    </Button>
  );
}
