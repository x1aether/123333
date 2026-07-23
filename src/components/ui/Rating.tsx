import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({
  rating,
  reviewCount,
  size = "sm",
  className,
}: RatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.floor(rating)
                ? "fill-luxury-gold text-luxury-gold"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
