import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

export type DropdownAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive";
};

type ActionDropdownProps = {
  actions: DropdownAction[];
};

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
