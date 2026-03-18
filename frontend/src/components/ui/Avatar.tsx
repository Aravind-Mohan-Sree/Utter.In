'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuImagePlus, LuLoaderCircle, LuMaximize } from 'react-icons/lu';
import { RiDeleteBin6Line } from 'react-icons/ri';

import Button from '~components/ui/Button';
import { errorHandler } from '~utils/errorHandler';
import { utterAlert } from '~utils/utterAlert';
import { utterToast } from '~utils/utterToast';

import { API_ROUTES } from '~constants/routes';

import AvatarUploadModal from '../modals/AvatarUploadModal';

type AvatarProps = {
  user: {
    id?: string;
    name: string;
    role: 'user' | 'tutor' | 'admin';
  };
  size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  handleAvatarUpload?: (croppedBlob: Blob) => Promise<void>;
  handleAvatarDeletion?: () => Promise<void>;
  editable?: boolean;
  interactive?: boolean;
};

const failedAvatars = new Set<string>();

const Avatar = ({
  user,
  size,
  handleAvatarUpload,
  handleAvatarDeletion,
  editable = false,
  interactive = true,
}: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-22 h-22',
    xxl: 'w-28 h-28',
  };
  const fontClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    xxl: 'text-6xl',
  };
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAvatarUrl = () => {
    if (!user.id || user.role === 'admin' || failedAvatars.has(user.id)) return null;
    const baseUrl = user.role === 'tutor' ? API_ROUTES.TUTOR.FETCH_AVATAR : API_ROUTES.USER.FETCH_AVATAR;
    return `${baseUrl}/${user.id}.jpeg?v=${version}`;
  };

  const [imgSrc, setImgSrc] = useState<string | null>(getAvatarUrl());

  useEffect(() => {
    setImgSrc(getAvatarUrl());
  }, [user.id, user.role, version]);

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

  const handleUploadSuccess = async (croppedBlob: Blob) => {
    await handleAvatarUpload!(croppedBlob);
    if (user.id) failedAvatars.delete(user.id);
    setVersion(Date.now());
  };

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
          if (user.id) failedAvatars.add(user.id);
          setVersion(Date.now());
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
        className={`relative ${sizeClasses[size]} mx-auto rounded-full group/avatar overflow-hidden flex items-center justify-center bg-rose-50 border-1 border-rose-200 ${editable || (interactive && imgSrc) ? 'cursor-pointer' : ''}`}
        onClick={(e) => {
          if (interactive && (editable || imgSrc)) {
            e.stopPropagation();
            if (editable) {
              setIsMenuOpen(!isMenuOpen);
            } else if (imgSrc) {
              setIsPreviewOpen(true);
            }
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt="avatar"
            width={400}
            height={400}
            className="w-full h-auto max-w-[124px] rounded-full object-cover aspect-square"
            onError={() => {
              if (user.id) failedAvatars.add(user.id);
              setImgSrc(null);
            }}
          />
        ) : (
          <span
            className={`text-rose-400 font-bold uppercase select-none flex justify-center items-center ${fontClasses[size]}`}
          >
            {user.name && user.name[0]}
          </span>
        )}

        {interactive && (editable || imgSrc) && (
          <div
            className={`absolute inset-0 ${imgSrc || editable
              ? 'bg-black/40 backdrop-blur-[2px]'
              : ''
              }  flex flex-col items-center justify-center gap-4 transition-all duration-200 rounded-full z-10 ${isMenuOpen
                ? 'opacity-100 pointer-events-auto'
                : `opacity-0 pointer-events-none group-hover/avatar:opacity-100 group-hover/avatar:pointer-events-auto`
              } ${isLoading && 'opacity-100'}`}
          >
            {isLoading && <LuLoaderCircle className="animate-spin" size={30} />}

            {user.role !== 'admin' && !isLoading && editable && (
              <span onClick={(e) => e.stopPropagation()} className="contents">
                <Button
                  variant="transparent"
                  icon={
                    <LuImagePlus className="transition-transform" />
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
                    variant='transparent'
                    icon={
                      <LuMaximize className="transition-transform" />
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
                      variant="transparent"
                      icon={
                        <RiDeleteBin6Line className="transition-transform" />
                      }
                      size={0}
                      onClick={handleDelete}
                    />
                  </span>
                )}
              </>
            )}
          </div>
        )}
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
        handleAvatarUpload={handleUploadSuccess}
        inputRef={inputRef}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};

export default Avatar;
