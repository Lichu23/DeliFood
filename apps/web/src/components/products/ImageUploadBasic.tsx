  'use client';

  import { useState } from 'react';
  import { Button } from '@/components/ui/Button';
  import { ImageIcon, Upload, X } from 'lucide-react';

  interface ImageUploadBasicProps {
    imageUrl?: string;
    onImageUpload: (url: string) => void;
  }

  export function ImageUploadBasic({
    imageUrl,
    onImageUpload,
  }: ImageUploadBasicProps) {
    const [preview, setPreview] = useState<string>(imageUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:4000/api/uploads/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error al subir la imagen');
        }

        const data = await response.json();
        onImageUpload(data.data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen');
        setPreview('');
      } finally {
        setIsUploading(false);
      }
    };

    const handleRemove = () => {
      setPreview('');
      onImageUpload('');
    };

    return (
      <div className="space-y-4">
        {/* Preview */}
        {preview ? (
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Sin imagen</p>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              disabled={isUploading}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Subiendo...' : preview ? 'Cambiar imagen' : 'Subir imagen'}
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Formatos: JPG, PNG, WebP. Máximo 5MB
          </p>
        </div>
      </div>
    );
  }