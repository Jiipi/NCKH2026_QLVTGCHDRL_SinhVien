import React, { useRef } from 'react';
import { Camera, X, Upload, Zap } from 'lucide-react';

export default function ScannerControls({ 
    isScanning, 
    isStarting, 
    hasTorch, 
    torchOn, 
    onStart, 
    onStop, 
    onFileUpload, 
    onToggleTorch 
}) {
    const fileInputRef = useRef(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {!isScanning ? (
                <button
                    onClick={onStart}
                    disabled={isStarting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition hover:bg-blue-700 disabled:opacity-70"
                >
                    <Camera size={24} />
                    <span className="font-semibold text-lg">
                        {isStarting ? 'Đang khởi động...' : 'Bật Camera'}
                    </span>
                </button>
            ) : (
                <button
                    onClick={onStop}
                    className="w-full bg-red-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition hover:bg-red-700"
                >
                    <X size={24} />
                    <span className="font-semibold text-lg">Dừng Quét</span>
                </button>
            )}

            {isScanning && hasTorch && (
                <button
                    onClick={onToggleTorch}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-3 transition ${torchOn ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-white'}`}>
                    <Zap size={20} />
                    <span className="font-semibold">{torchOn ? 'Tắt đèn' : 'Bật đèn'}</span>
                </button>
            )}

            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 font-medium">hoặc</span>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e.target.files[0])}
                className="hidden"
            />
            <button
                onClick={handleFileClick}
                className="w-full bg-gray-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition hover:bg-gray-700"
            >
                <Upload size={24} />
                <span className="font-semibold text-lg">Tải ảnh lên</span>
            </button>
        </div>
    );
}
