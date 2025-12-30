import { Area } from 'react-easy-crop';

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });

const getCroppedImg = async (imageSrc: string, crop: Area) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg');
  });
};

export default getCroppedImg;
