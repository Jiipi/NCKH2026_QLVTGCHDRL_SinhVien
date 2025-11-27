import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Loader } from 'lucide-react';
import http from '../../api/http';
import { useNotification } from '../../contexts/NotificationContext';

export default function AvatarUpload({ value, onChange, size = 200, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await http.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedUrl = response.data?.data?.url;
      console.log('đŸ“¤ Upload response:', response.data);
      console.log('đŸ–¼ï¸ Uploaded URL:', uploadedUrl);
      
      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
        console.log('âœ… Calling onChange with URL:', uploadedUrl);
        onChange(uploadedUrl);
        showSuccess('Upload avatar thành công!');
      } else {
        throw new Error('Không nhận được URL từ server');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError(error.response?.data?.message || 'Lỗi upload avatar');
      // Revert preview on error
      setPreviewUrl(value || null);
    } finally {
      setUploading(false);
    }
  };

  // Handle click on upload area
  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle remove avatar
  const handleRemove = (e) => {
    e.stopPropagation();
    if (disabled || uploading) return;

    setPreviewUrl(null);
    onChange('');
    showSuccess('ÄĂ£ xĂ³a avatar');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview Circle */}
      <div
        className={`relative rounded-full overflow-hidden border-4 transition-all duration-300 ${
          dragOver ? 'border-blue-500 scale-105' : 'border-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Preview Image or Placeholder */}
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 px-4">
                {dragOver ? 'Thả ảnh vào đây' : 'Click hoặc kéo thả'}
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Remove Button */}
        {previewUrl && !uploading && !disabled && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Xóa avatar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {uploading ? (
            <span className="text-blue-600 font-medium">Äang upload...</span>
          ) : (
            <>
              Click hoặc kéo thả ảnh vào khung
              <br />
              <span className="text-xs text-gray-500">
                JPG, PNG, GIF, WEBP - Tối Đa 5MB
              </span>
            </>
          )}
        </p>
      </div>

      {/* Current URL (for debugging) */}
      {value && (
        <div className="w-full max-w-md">
          <p className="text-xs text-gray-400 truncate" title={value}>
            URL: {value}
          </p>
        </div>
      )}
    </div>
  );
}
