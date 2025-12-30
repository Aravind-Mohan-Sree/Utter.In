import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import AvatarUploadModal from './AvatarUploadModal';
import Button from '~components/shared/Button';
import { createPortal } from 'react-dom';
import { LuImagePlus, LuMaximize } from 'react-icons/lu';
import { RiDeleteBin6Line } from 'react-icons/ri';

type AvatarProps = {
  user: { name: string; avatarUrl?: string };
  handleAvatarUpload: (croppedBlob: Blob) => Promise<void>;
  handleAvatarDeletion: () => Promise<void>;
};

const Avatar = ({
  user,
  handleAvatarUpload,
  handleAvatarDeletion,
}: AvatarProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="relative w-25 h-25 sm:w-32 sm:h-32 mx-auto rounded-full group overflow-hidden flex items-center justify-center bg-rose-100 border-2 border-rose-200"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt="avatar"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-rose-400 text-4xl font-bold uppercase select-none">
            {user.name[0]}
          </span>
        )}

        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 transition-all duration-300 rounded-full z-10 ${
            isMenuOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto'
          }`}
        >
          <Button
            variant="outline"
            icon={
              <LuImagePlus className="transition-transform hover:scale-150 hover:rotate-12" />
            }
            size={0}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              inputRef.current?.click();
            }}
          />

          {user.avatarUrl && (
            <>
              <Button
                variant="outline"
                icon={
                  <LuMaximize className="transition-transform hover:scale-150 hover:rotate-12" />
                }
                size={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsPreviewOpen(true);
                }}
              />

              <Button
                variant="outline"
                icon={
                  <RiDeleteBin6Line className="transition-transform hover:scale-150 hover:rotate-12" />
                }
                size={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  handleAvatarDeletion();
                }}
              />
            </>
          )}
        </div>
      </div>

      {isPreviewOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-rose-100/30 backdrop-blur-md p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="relative w-full max-w-[min(80vw,400px)] aspect-square rounded-full border-2 border-rose-200 shadow-xl overflow-hidden bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={user.avatarUrl as string}
                alt="avatar-preview"
                fill
                className="object-cover"
              />
            </div>
          </div>,
          document.body,
        )}

      <AvatarUploadModal
        handleAvatarUpload={handleAvatarUpload}
        inputRef={inputRef}
      />
    </div>
  );
};

export default Avatar;
