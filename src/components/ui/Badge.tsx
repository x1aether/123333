import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "sale" | "new";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
    gold: "bg-luxury-gold/20 text-luxury-gold",
    sale: "bg-red-500 text-white",
    new: "bg-luxury-black dark:bg-luxury-white text-luxury-white dark:text-luxury-black",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
