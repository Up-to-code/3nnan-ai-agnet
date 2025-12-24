import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SocialButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  iconColor?: string;
}

export function SocialButton({
  icon: Icon,
  label,
  onClick,
  iconColor,
}: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 bg-background hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <Icon className={`ml-2 h-4 w-4 ${iconColor || ''}`} />
      {label}
    </Button>
  );
}

