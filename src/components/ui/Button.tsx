import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

const VARIANT_CLASSES: Record<NonNullable<Props["variant"]>, string> = {
  solid: "bg-rose text-white hover:bg-brown",
  outline: "border-2 border-brown text-brown hover:bg-brown hover:text-cream-light",
  ghost: "bg-cream text-brown hover:bg-cream-light",
};

const SIZE_CLASSES: Record<NonNullable<Props["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  children,
  variant = "solid",
  size = "md",
  className = "",
  href,
  external = false,
  onClick,
  type = "button",
}: Props) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors duration-300 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
