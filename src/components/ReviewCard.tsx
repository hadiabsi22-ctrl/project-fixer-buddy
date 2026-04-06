import { Link } from "react-router-dom";
import { getRatingLabel } from "@/lib/utils";

interface Review {
  id: string;
  title: string;
  slug: string;
  cover: string;
  rating: number;
  category: string;
  excerpt: string;
  date: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Link to={`/reviews/${review.slug}`}>
      <article className="gaming-card group cursor-pointer">
        {/* Cover Image */}
        <div className="relative aspect-video overflow-hidden">
          <LazyImage
            src={review.cover}
            alt={review.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center bg-[#a855f7] text-white p-2 rounded-2xl min-w-[56px] shadow-lg">
            <span className="text-lg font-black leading-none">{review.rating}</span>
            <span className="text-[9px] font-bold mt-0.5 opacity-90">
              {getRatingLabel(review.rating)}
            </span>
          </div>
          {/* Category Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-sm font-medium text-foreground">
            {review.category}
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {review.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {review.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{review.date}</span>
            <span className="text-primary text-sm font-medium group-hover:translate-x-[-4px] transition-transform">
              قراءة المزيد ←
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ReviewCard;
