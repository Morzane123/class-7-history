"use client";

import { useRef } from "react";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  setImages: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ images, setImages }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`图片 ${file.name} 超过5MB，已跳过`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        return;
      }

      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setImages([...images, ...newImages]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#d2d2d7] rounded-lg p-8 text-center cursor-pointer hover:border-[#0071e3] transition-colors"
      >
        <svg className="w-12 h-12 mx-auto text-[#86868b] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-[#6e6e73]">点击或拖拽上传图片</p>
        <p className="text-sm text-[#86868b] mt-1">支持 JPG、PNG、GIF，最大 5MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview}
                alt=""
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
