"use client";

const iconClass = "h-4 w-4 stroke-current";
const iconProps = {
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function createIcon(paths: React.ReactNode) {
  return ({ className = iconClass }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      {paths}
    </svg>
  );
}

export const HomeIcon = createIcon(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5v10h14v-10" />
  </>
);

export const BookIcon = createIcon(
  <>
    <path d="M4 5.5h11a3 3 0 0 1 3 3v10.5" />
    <path d="M4 5.5v12a3 3 0 0 0 3 3h11" />
    <path d="M4 8h11" />
  </>
);

export const PathIcon = createIcon(
  <>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <circle cx="12" cy="12" r="3.5" />
  </>
);

export const BlogIcon = createIcon(
  <>
    <path d="M5 5h9a4 4 0 0 1 4 4v9H9a4 4 0 0 1-4-4V5z" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
  </>
);

export const DashboardIcon = createIcon(
  <>
    <path d="M4 13h6v7H4z" />
    <path d="M14 4h6v16h-6z" />
    <path d="M4 4h6v6H4z" />
  </>
);

export const CompareIcon = createIcon(
  <>
    <path d="M8 4v16" />
    <path d="M16 20V4" />
    <path d="M4 8h8" />
    <path d="M12 16h8" />
  </>
);

export const HeartIcon = createIcon(
  <path d="M12 20s-6-4.4-8.2-8.3a4.5 4.5 0 0 1 7.7-4.7L12 7.6l.5-.6a4.5 4.5 0 0 1 7.7 4.7C18 15.6 12 20 12 20z" />
);

export const CartIcon = createIcon(
  <>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L21 8H7" />
  </>
);

export const ReceiptIcon = createIcon(
  <>
    <path d="M7 3h10l1 2v16l-3-2-3 2-3-2-3 2V5l1-2z" />
    <path d="M9 9h6" />
    <path d="M9 13h6" />
  </>
);

export const SupportIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M8 12h1.5a2.5 2.5 0 1 0 5 0H16" />
  </>
);

export const SparkIcon = createIcon(
  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
);

export const ShieldIcon = createIcon(
  <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" />
);
