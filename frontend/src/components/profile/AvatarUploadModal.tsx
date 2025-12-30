import Cropper, { Area } from 'react-easy-crop';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import getCroppedImg from '~utils/cropImage';
import Button from '~components/shared/Button';
import { LuCircleX } from 'react-icons/lu';

type ImageUploadProps = {
  handleAvatarUpload: (croppedBlob: Blob) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const AvatarUploadModal = ({
  handleAvatarUpload,
  inputRef,
}: ImageUploadProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

    setImageSrc(null);

    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    handleAvatarUpload(croppedBlob);
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageSrc &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-rose-100/30 backdrop-blur-md p-1">
            <div
              className="relative w-[428px] bg-white border-2 rounded-xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                className="absolute top-3.5 right-3"
                icon={
                  <LuCircleX className="text-rose-400 hover:text-rose-600" />
                }
                fontSize={30}
                size={0}
                variant="outline"
                onClick={() => {
                  setImageSrc(null);
                }}
              />

              {/* Helper Text */}
              <ul className="text-black text-xs pb-2 space-y-1">
                <li>• Mouse wheel / pinch to zoom</li>
                <li>• Drag to reposition</li>
                <li>• Double tap to center</li>
              </ul>

              {/* Crop Area */}
              <div
                className="relative w-full h-[400px]"
                onDoubleClick={handleDoubleTap}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape={'round'}
                />
              </div>

              <Button
                className="mx-auto mt-3"
                text="Upload"
                onClick={handleUpload}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AvatarUploadModal;
