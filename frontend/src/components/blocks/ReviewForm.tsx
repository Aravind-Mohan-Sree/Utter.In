import React, { useState } from 'react';
import StarRating from '~components/ui/StarRating';
import Button from '~components/ui/Button';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';

interface ReviewFormProps {
  initialRating?: number;
  initialNote?: string;
  onSubmit: (rating: number, note: string) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Post',
  isEditing = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async () => {
    if (rating === 0) {
      utterToast.error('Please select a rating');
      return;
    }
    if (!note.trim()) {
      utterToast.error('Please write a review note');
      return;
    }
    if (note.trim().length < 5) {
      utterToast.error('Review note must be at least 5 characters long');
      return;
    }

    if (isEditing && rating === initialRating && note.trim() === initialNote.trim()) {
      utterToast.info('No changes were made');
      onCancel?.();
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, note.trim());
      if (!isEditing) {
        setRating(0);
        setNote('');
      }
    } catch (error) {
      // Error handling is likely done in the parent (ReviewSection) or via errorHandler
      // We catch it here to stop the loading state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white/50 p-6 rounded-xl border border-rose-100 mb-8">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} interactive={true} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Your Experience</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Share your learning experience with this tutor..."
          className="w-full text-gray-700 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[100px] bg-white placeholder:text-gray-400"
        />
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            text="Cancel"
            onClick={onCancel}
            variant="outline"
          />
        )}
        <Button
          text={submitLabel}
          isLoading={loading}
          onClick={handleFormSubmit}
          fullWidth={false}
        />
      </div>
    </div>
  );
};

export default ReviewForm;
