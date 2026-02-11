'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import AvatarUploadModal from '../profile/AvatarUploadModal';
import Button from '~components/shared/Button';
import { createPortal } from 'react-dom';
import { LuImagePlus, LuLoaderCircle, LuMaximize } from 'react-icons/lu';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { utterAlert } from '~utils/utterAlert';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';

type AvatarProps = {
  user: {
    name: string;
    avatarUrl: string | null;
    role: 'user' | 'tutor' | 'admin';
  };
  size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  handleAvatarUpload?: (croppedBlob: Blob) => Promise<void>;
  handleAvatarDeletion?: () => Promise<void>;
  editable?: boolean;
};

const Avatar = ({
  user,
  size,
  handleAvatarUpload,
  handleAvatarDeletion,
  editable = true,
}: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-22 h-22 text-2xl',
    xxl: 'w-28 h-28 text-5xl',
  };
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(user.avatarUrl || null);

  useEffect(() => {
    setImgSrc(user.avatarUrl || null);
  }, [user.avatarUrl]);

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

  const handleDelete = async () => {
    setIsMenuOpen(false);
    utterAlert({
      title: 'Are you sure',
      text: 'Do you really want to delete?',
      icon: 'question',
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await handleAvatarDeletion!();
        } catch (err) {
          utterToast.error(errorHandler(err));
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`relative ${sizeClasses[size]} mx-auto rounded-full group overflow-hidden flex items-center justify-center bg-rose-50 border-1 border-rose-200 ${(editable || imgSrc) ? 'cursor-pointer' : ''}`}
        onClick={() => (editable || imgSrc) && setIsMenuOpen(!isMenuOpen)}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt="avatar"
            width={400}
            height={400}
            className="w-full h-auto max-w-[124px] rounded-full object-cover aspect-square"
            onError={() => setImgSrc(null)}
          />
        ) : (
          <span
            className={`text-rose-400 text-4xl font-bold uppercase select-none ${sizeClasses[size]} flex justify-center items-center`}
          >
            {user.name && user.name[0]}
          </span>
        )}

        <div
          className={`absolute inset-0 ${user.role === 'user' || user.role === 'tutor' || imgSrc
            ? 'bg-black/40 backdrop-blur-[2px]'
            : ''
            }  flex flex-col items-center justify-center gap-4 transition-all duration-200 rounded-full z-10 ${isMenuOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto'
            } ${isLoading && 'opacity-100'}`}
        >
          {isLoading && <LuLoaderCircle className="animate-spin" size={30} />}

          {user.role !== 'admin' && !isLoading && editable && (
            <span onClick={(e) => e.stopPropagation()} className="contents">
              <Button
                variant="outline"
                icon={
                  <LuImagePlus className="transition-transform hover:scale-135 hover:rotate-12" />
                }
                size={0}
                onClick={() => {
                  setIsMenuOpen(false);
                  inputRef.current?.click();
                }}
              />
            </span>
          )}

          {imgSrc && !isLoading && (
            <>
              <span onClick={(e) => e.stopPropagation()} className="contents">
                <Button
                  variant="outline"
                  icon={
                    <LuMaximize className="transition-transform hover:scale-135 hover:rotate-12" />
                  }
                  size={0}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsPreviewOpen(true);
                  }}
                />
              </span>

              {user.role !== 'admin' && editable && (
                <span onClick={(e) => e.stopPropagation()} className="contents">
                  <Button
                    variant="outline"
                    icon={
                      <RiDeleteBin6Line className="transition-transform hover:scale-135 hover:rotate-12" />
                    }
                    size={0}
                    onClick={handleDelete}
                  />
                </span>
              )}
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
              className="relative w-full max-w-[min(80vw,400px)] aspect-square rounded-full border-1 border-rose-200 shadow-xl overflow-hidden bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={imgSrc as string}
                alt="avatar-preview"
                fill
                sizes="(max-width: 500px) 80vw, 400px"
                className="object-cover"
              />
            </div>
          </div>,
          document.body,
        )}

      <AvatarUploadModal
        handleAvatarUpload={handleAvatarUpload!}
        inputRef={inputRef}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};

export default Avatar;
