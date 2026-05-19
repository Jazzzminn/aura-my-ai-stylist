import type { Garment } from "@/lib/aura";
import { cn } from "@/lib/utils";

/**
 * Stylized garment "silhouette" rendered with pure CSS — no images needed.
 * Different shapes by category, color drives the swatch.
 */
export function GarmentVisual({
  garment,
  size = "md",
  className,
}: {
  garment: Garment;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "sm" ? "h-14 w-14" : size === "lg" ? "h-40 w-40" : "h-24 w-24";
  return (
    <div className={cn("relative flex items-center justify-center", dims, className)}>
      {garment.imageUrl ? (
        <img
          src={garment.imageUrl}
          alt={garment.name}
          className="h-full w-full rounded-xl object-cover border border-border/60"
        />
      ) : (
        <Shape category={garment.category} color={garment.color} />
      )}
    </div>
  );
}

function Shape({ category, color }: { category: Garment["category"]; color: string }) {
  switch (category) {
    case "top":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M20 30 L40 18 Q50 14 60 18 L80 30 L72 42 L66 38 L66 82 Q50 86 34 82 L34 38 L28 42 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
    case "bottom":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M28 14 L72 14 L74 40 L62 86 L52 86 L50 50 L48 50 L46 86 L36 86 L26 40 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
    case "dress":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M32 18 Q50 12 68 18 L62 40 L80 88 L20 88 L38 40 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
    case "outerwear":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M18 28 L40 16 L50 22 L60 16 L82 28 L78 86 L60 86 L52 30 L48 30 L40 86 L22 86 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
    case "shoes":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M14 60 Q14 48 30 48 L60 48 Q86 48 88 64 Q88 74 78 76 L20 76 Q14 74 14 66 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
    case "accessory":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d="M32 36 Q32 22 50 22 Q68 22 68 36 L78 38 L82 84 L18 84 L22 38 Z"
            fill={color}
            stroke="rgba(45,42,38,0.18)"
            strokeWidth="1"
          />
        </svg>
      );
  }
}
