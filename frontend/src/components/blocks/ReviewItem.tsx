import React, { useState } from 'react';
import { FaPencil, FaTrash } from 'react-icons/fa6';

import Avatar from '~components/ui/Avatar';
import StarRating from '~components/ui/StarRating';
import { Review } from '~services/user/reviewService';

import ReviewForm from './ReviewForm';

interface ReviewItemProps {
  review: Review;
  isOwner: boolean;
  onUpdate: (id: string, rating: number, note: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  isOwner,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ReviewForm
        initialRating={review.rating}
        initialNote={review.note}
        isEditing={true}
        submitLabel="Update"
        onSubmit={async (rating, note) => {
          await onUpdate(review.id, rating, note);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white/40 p-5 rounded-xl border border-gray-100 mb-4 transition-all hover:bg-white/60">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <Avatar
            user={{
              id: review.userId,
              name: review.userName || 'Unknown',
              role: 'user',
            }}
            size="sm"
            editable={false}
          />
          <div>
            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
            <div className="flex items-center gap-2">
               <StarRating rating={review.rating} />
               <div className="flex items-center gap-1 text-xs text-gray-400">
                 <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                 {new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime() + 1000 && (
                   <span className="italic font-medium text-rose-300">· edited</span>
                 )}
               </div>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer p-2 text-gray-500 hover:text-rose-600 transition-colors"
              title="Edit review"
            >
              <FaPencil size={14} />
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="cursor-pointer p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Delete review"
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed pl-1">
        {review.note}
      </p>
    </div>
  );
};

export default ReviewItem;
