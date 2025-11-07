import { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Card({ title, description, children, footer }: CardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {(title || description) && (
        <div className="p-6 pb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
      {footer && <div className="border-t p-6 pt-4">{footer}</div>}
    </div>
  );
}
