export const validateVideoDuration = (file: File, maxSeconds: number) => {
  if (typeof window === 'undefined') {
    return Promise.resolve(true);
  }

  if (!(file instanceof File) || !file) {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration < maxSeconds);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    video.src = url;
  });
};
