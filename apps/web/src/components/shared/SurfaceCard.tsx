import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

type SurfaceCardProps = HTMLAttributes<HTMLDivElement>;

export function SurfaceCard({ className, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cn("surface-card rounded-3xl", className)}
      {...props}
    />
  );
}
