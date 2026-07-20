import { FaStar, FaRegStar } from "react-icons/fa";

export default function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-rose ${className}`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < Math.round(rating) ? <FaStar key={i} size={size} /> : <FaRegStar key={i} size={size} />
      )}
    </span>
  );
}
