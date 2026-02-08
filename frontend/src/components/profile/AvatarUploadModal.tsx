'use client';

import Cropper, { Area } from 'react-easy-crop';
import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import getCroppedImg from '~utils/cropImage';
import Button from '~components/shared/Button';
import { LuCircleX } from 'react-icons/lu';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';

type ImageUploadProps = {
  handleAvatarUpload: (croppedBlob: Blob) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const AvatarUploadModal = ({
  handleAvatarUpload,
  inputRef,
  setIsLoading,
}: ImageUploadProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (imageSrc && croppedAreaPixels) {
      const timer = setTimeout(() => {
        setZoom(zoom + 0.0000001);
        setTimeout(() => setZoom(zoom), 50);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [crop, imageSrc, zoom, croppedAreaPixels]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDoubleTap = () => {
    setCrop({ x: 0, y: 0 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsLoading(true);
      setImageSrc(null);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (croppedBlob) {
        await handleAvatarUpload(croppedBlob);
        setImageSrc(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      }
    } catch (error) {
      utterToast.error(errorHandler(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageSrc &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
              className="relative w-full max-w-[450px] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Edit Avatar</h3>
                <button
                  onClick={() => setImageSrc(null)}
                  className="text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LuCircleX size={24} />
                </button>
              </div>

              <div className="p-4">
                <ul className="text-[11px] text-gray-500 mb-4 grid grid-cols-1 gap-1 bg-gray-50 p-2 rounded-lg">
                  <li>• Drag to move</li>
                  <li>• Double click to center</li>
                </ul>

                <div
                  className="relative w-full h-[350px] bg-gray-200 rounded-lg overflow-hidden border"
                  onDoubleClick={handleDoubleTap}
                >
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    zoomWithScroll={false}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-gray-400">
                      Zoom
                    </span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>

                  <Button
                    text="Upload"
                    fullWidth
                    onClick={handleUpload}
                    className="mt-2 shadow-lg shadow-rose-200"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AvatarUploadModal;
