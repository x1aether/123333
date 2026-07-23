import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      gold: "btn-gold",
      ghost:
        "inline-flex items-center justify-center text-luxury-black dark:text-luxury-white hover:text-luxury-gold transition-colors",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-8 py-3",
      lg: "px-10 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size],
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
