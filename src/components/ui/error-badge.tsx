
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ErrorBadgeProps {
  error?: string;
  className?: string;
}

export const ErrorBadge = ({ error, className = "" }: ErrorBadgeProps) => {
  if (!error) return null;

  return (
    <div className={`absolute -top-2 -right-2 z-20 ${className}`}>
      <Badge variant="destructive" className="text-xs px-2 py-0.5 flex items-center gap-1 shadow-md">
        <AlertCircle className="w-3 h-3" />
        <span className="max-w-20 truncate">{error}</span>
      </Badge>
    </div>
  );
};
