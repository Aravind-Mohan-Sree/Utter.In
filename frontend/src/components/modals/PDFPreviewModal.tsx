'use client';

import { BaseModal } from './BaseModal';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export const PDFPreviewModal = ({
  isOpen,
  onClose,
  pdfUrl,
  title = 'Document Preview',
}: PDFPreviewModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="6xl"
      className="h-[90vh]"
      noPadding={true}
    >
      <div className="w-full h-[75vh] overflow-hidden bg-gray-50">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">No document selected</p>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
