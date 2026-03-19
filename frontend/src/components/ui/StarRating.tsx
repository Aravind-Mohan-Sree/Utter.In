import React from 'react';
import { FaRegStar,FaStar } from 'react-icons/fa6';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  interactive = false,
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRatingChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        >
          {star <= rating ? (
            <FaStar className="text-yellow-400 text-xl" />
          ) : (
            <FaRegStar className="text-gray-300 text-xl" />
          )}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
