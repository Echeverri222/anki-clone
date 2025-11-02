'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, onImageRemove, currentImageUrl, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get pre-signed URL from your API
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: file.name,
          fileType: file.type 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to get upload URL (${response.status})`);
      }

      const { uploadUrl, fileUrl } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Call the callback with the final URL
      onImageUpload(fileUrl);
    } catch (err) {
      console.error('Upload error:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Cannot connect to server. Make sure the app is running.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Image (optional)</label>
      
      {currentImageUrl ? (
        <div className="relative">
          <Image 
            src={currentImageUrl} 
            alt="Card image" 
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onImageRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
