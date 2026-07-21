import { FiImage } from "react-icons/fi";

export default function ImagePlaceholder({
  emoji,
  className = "",
}: {
  emoji: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cream to-rose/20 text-brown/40 ${className}`}
    >
      <span className="text-5xl grayscale opacity-70">{emoji}</span>
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <FiImage size={13} />
        Image Coming Soon
      </div>
    </div>
  );
}
