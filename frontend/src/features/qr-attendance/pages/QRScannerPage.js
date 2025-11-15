import React from 'react';

// Refactored imports
import { useQRScanner } from '../hooks/useQRScanner';
import ScannerView from '../components/ScannerView';
import ScanResultDisplay from '../components/ScanResultDisplay';
import ScannerControls from '../components/ScannerControls';

// Shared components
import ErrorMessage from '../../../shared/components/common/ErrorMessage';

const QRScannerHeader = () => (
    <div className="p-8 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Quét mã QR Điểm danh</h1>
        <p className="text-blue-200">Sử dụng camera của bạn hoặc tải ảnh lên để thực hiện điểm danh nhanh chóng.</p>
    </div>
);

export default function QRScannerPage() {
    const {
        videoRef,
        isScanning,
        isStarting,
        isProcessing,
        scanResult,
        error,
        hasTorch,
        torchOn,
        startCamera,
        stopCamera,
        handleFileUpload,
        toggleTorch,
        resetScanner,
    } = useQRScanner();

    return (
        <div className="p-4 md:p-6 space-y-6">
            <QRScannerHeader />

            <div className="bg-white rounded-2xl shadow-md p-6">
                {isProcessing ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg font-semibold">Đang xử lý điểm danh...</p>
                    </div>
                ) : scanResult ? (
                    <ScanResultDisplay result={scanResult} onReset={resetScanner} />
                ) : (
                    <>
                        <ScannerView ref={videoRef} isScanning={isScanning} isStarting={isStarting} />
                        {error && <ErrorMessage message={error} />}
                        <ScannerControls 
                            isScanning={isScanning}
                            isStarting={isStarting}
                            hasTorch={hasTorch}
                            torchOn={torchOn}
                            onStart={startCamera}
                            onStop={stopCamera}
                            onFileUpload={handleFileUpload}
                            onToggleTorch={toggleTorch}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

