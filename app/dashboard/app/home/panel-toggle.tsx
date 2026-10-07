import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function PanelToggle({
  icon: Icon,
  label,
  active,
  onToggle,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={`Toggle ${label.toLowerCase()} panel`}
      aria-label={`Toggle ${label.toLowerCase()} panel`}
      aria-pressed={active}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-white/10 text-sky-400"
          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
