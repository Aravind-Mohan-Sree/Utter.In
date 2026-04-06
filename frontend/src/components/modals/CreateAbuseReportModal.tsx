'use client';

import { useState } from 'react';
import { GoX } from 'react-icons/go';

import Button from '~components/ui/Button';

interface CreateAbuseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, description: string) => void;
  reportedName: string;
  isLoading?: boolean;
  isVideoCall?: boolean;
}

const ABUSE_TYPES = [
  'Harassment',
  'Spam',
  'Inappropriate Content',
  'Hate Speech',
  'Fraud/Scam',
  'Other'
];

export default function CreateAbuseReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportedName,
  isLoading,
  isVideoCall
}: CreateAbuseReportModalProps) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!type || description.trim().length < 10) return;
    onSubmit(type, description);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <h3 className="text-xl font-bold text-gray-800">Report Abuse</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <GoX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            You are reporting <span className="font-bold text-gray-800">{reportedName}</span> for misconduct.
          </p>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Abuse Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ABUSE_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${type === t
                      ? 'bg-rose-100 border-rose-500 text-rose-600'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what happened..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 outline-none transition-all h-32 resize-none no-scrollbar text-black"
            />
            <p className="text-[10px] text-gray-400 mt-1">Minimum 10 characters.</p>
          </div>

          <p className="text-[11px] text-gray-500 italic text-center px-4 leading-relaxed">
            {isVideoCall 
              ? 'Note: The last 60 seconds of video evidence from the reported person will be shared with moderators to provide context.'
              : 'Note: The last 5 messages from this chat will be shared with the moderators to provide context for your report.'}
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              text='Submit'
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl border-none shadow-lg shadow-rose-200"
              onClick={handleSubmit}
              disabled={!type || description.trim().length < 10}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
