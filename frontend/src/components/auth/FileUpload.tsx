import React, { useState } from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  name: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  Icon: React.ElementType;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  name,
  accept,
  onChange,
  error,
  Icon,
}) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    } else {
      setFileName('');
      e.target.value = '';
    }
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center w-full h-32 border rounded-lg cursor-pointer border-gray-300 hover:border-rose-300`}
        >
          <div className="flex flex-col items-center justify-center p-5">
            <Icon className="text-gray-500 mb-2" size={20} />
            <p className="text-sm text-gray-500">Click to upload</p>
            {fileName && (
              <p className="text-xs text-rose-600 mt-2 font-medium">
                {fileName}
              </p>
            )}
          </div>
        </label>
      </div>
      {error && (
        <span className="text-sm text-red-500 wrap-break-word">{error}</span>
      )}
    </div>
  );
};
