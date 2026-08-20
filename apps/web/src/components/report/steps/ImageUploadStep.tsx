"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ImageUploadStepProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_COMPRESSED_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_IMAGES = 5;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploadStep({
  images,
  onImagesChange,
}: ImageUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previews, setPreviews] = useState<string[]>(() =>
    images.map((file) => URL.createObjectURL(file))
  );

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported format. Use JPG, PNG, or WEBP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds 10MB limit (${formatFileSize(file.size)}).`;
    }
    return null;
  };

  const compressImage = async (file: File): Promise<File> => {
    if (file.size <= MAX_COMPRESSED_SIZE) return file;

    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: file.type as string,
    };

    try {
      const compressed = await imageCompression(file, options);
      return new File([compressed], file.name, { type: file.type });
    } catch {
      return file;
    }
  };

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const newErrors: string[] = [];

      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        newErrors.push(`Maximum ${MAX_IMAGES} images allowed.`);
        setErrors(newErrors);
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        newErrors.push(
          `Only ${remainingSlots} more image(s) can be added. Extra files were ignored.`
        );
      }

      const validFiles: File[] = [];
      for (const file of filesToProcess) {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      setErrors(newErrors);

      if (validFiles.length === 0) return;

      setIsCompressing(true);
      try {
        const compressed = await Promise.all(validFiles.map(compressImage));
        const newImages = [...images, ...compressed];
        const newPreviews = [
          ...previews,
          ...compressed.map((f) => URL.createObjectURL(f)),
        ];
        setPreviews(newPreviews);
        onImagesChange(newImages);
      } finally {
        setIsCompressing(false);
      }
    },
    [images, previews, onImagesChange]
  );

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Upload Photos of the Problem
        </h2>
        <p className="text-sm text-gray-500">
          Take or upload up to {MAX_IMAGES} photos. Our AI will analyze them to
          identify the issue.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50/50 hover:border-gray-400",
          images.length >= MAX_IMAGES && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <ImageIcon className="h-8 w-8 text-blue-600" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your photos here
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, or WEBP up to 10MB each
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1 min-h-[48px]"
              onClick={() => cameraInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
            >
              <Camera className="h-5 w-5" />
              Take Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 min-h-[48px]"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
            >
              <Upload className="h-5 w-5" />
              Upload Photo
            </Button>
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Compressing indicator */}
      {isCompressing && (
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Compressing images...
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Photos ({images.length}/{MAX_IMAGES})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="text-[10px] text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-white/80">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
