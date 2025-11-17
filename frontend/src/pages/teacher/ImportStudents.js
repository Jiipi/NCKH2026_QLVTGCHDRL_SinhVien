import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../shared/api/http';
import { useNotification } from '../../contexts/NotificationContext';

export default function ImportStudents() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState({
    valid: [],
    invalid: []
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
        showError('Vui lĂ²ng chá»n file Excel (.xlsx, .xls) hoáº·c CSV (.csv)');
        return;
      }
      // Save file only; do not auto-parse. Clear previous preview state.
      setFile(selectedFile);
      setPreviewData([]);
      setValidationResults({ valid: [], invalid: [] });
    }
  };

  // Explicit action to upload and preview the selected file
  const handleUploadPreview = async () => {
    if (!file) {
      showWarning('Vui lĂ²ng chá»n file trÆ°á»›c khi táº£i lĂªn Ä‘á»ƒ kiá»ƒm tra');
      return;
    }
    await parseExcelFile(file);
  };

  const parseExcelFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await http.post('/teacher/students/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = response.data?.data || { valid: [], invalid: [] };
      setValidationResults(data);
      setPreviewData([...data.valid, ...data.invalid]);
    } catch (err) {
      console.error('Parse error:', err);
      showError('KhĂ´ng thá»ƒ Ä‘á»c file Excel. Vui lĂ²ng kiá»ƒm tra Ä‘á»‹nh dáº¡ng file.');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (validationResults.valid.length === 0) {
      showWarning('KhĂ´ng cĂ³ sinh viĂªn há»£p lá»‡ Ä‘á»ƒ import');
      return;
    }

    if (!window.confirm(`Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n import ${validationResults.valid.length} sinh viĂªn?`)) {
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await http.post('/teacher/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showSuccess(`Import thĂ nh cĂ´ng ${response.data?.data?.imported || 0} sinh viĂªn`);
      navigate('/teacher/students');
    } catch (err) {
      console.error('Import error:', err);
      showError(err.response?.data?.message || 'KhĂ´ng thá»ƒ import sinh viĂªn');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Try to get teacher's classes to provide a real class name
      let className = 'CTK46A';
      try {
        const clsRes = await http.get('/teacher/classes');
        const list = clsRes?.data?.data?.classes || [];
        if (Array.isArray(list) && list.length > 0) {
          className = String(list[0].ten_lop || className);
        }
      } catch (_) {
        // ignore and fallback to default className
      }

      // Generate unique MSSV/usernames to avoid duplicate validation errors
      const base = Date.now() % 10000000; // 7 digits
      const mssv1 = String(base).padStart(7, '0');
      const mssv2 = String((base + 1) % 10000000).padStart(7, '0');

      const template = `MSSV,Há» vĂ  tĂªn,Email,NgĂ y sinh (YYYY-MM-DD),Giá»›i tĂ­nh (nam/nu/khac),Lá»›p,Sá»‘ Ä‘iá»‡n thoáº¡i,Äá»‹a chá»‰,TĂªn Ä‘Äƒng nháº­p,Máº­t kháº©u\n${mssv1},Sinh ViĂªn Máº«u A,sv${mssv1}@dlu.edu.vn,2003-01-15,nam,${className},0900000001,Äá»‹a chá»‰ 1,${mssv1},123456\n${mssv2},Sinh ViĂªn Máº«u B,sv${mssv2}@dlu.edu.vn,2003-05-20,nu,${className},0900000002,Äá»‹a chá»‰ 2,${mssv2},123456`;

      const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'mau_import_sinh_vien.csv';
      link.click();
      
      showSuccess('ÄĂ£ táº£i xuá»‘ng file máº«u');
    } catch (e) {
      showError('KhĂ´ng thá»ƒ táº¡o file máº«u. Vui lĂ²ng thá»­ láº¡i.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/teacher/students')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay láº¡i danh sĂ¡ch
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import sinh viĂªn</h1>
        <p className="text-gray-600">Táº£i lĂªn file Excel hoáº·c CSV Ä‘á»ƒ import hĂ ng loáº¡t sinh viĂªn vĂ o lá»›p phá»¥ trĂ¡ch</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">HÆ°á»›ng dáº«n import</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>â€¢ File Excel/CSV pháº£i cĂ³ cĂ¡c cá»™t: MSSV, Há» vĂ  tĂªn, Email, NgĂ y sinh, Giá»›i tĂ­nh, Lá»›p, SÄT, Äá»‹a chá»‰, TĂªn Ä‘Äƒng nháº­p, Máº­t kháº©u</li>
              <li>â€¢ MSSV pháº£i duy nháº¥t vĂ  khĂ´ng Ä‘Æ°á»£c trĂ¹ng trong há»‡ thá»‘ng</li>
              <li>â€¢ Email pháº£i Ä‘Ăºng Ä‘á»‹nh dáº¡ng @dlu.edu.vn</li>
              <li>â€¢ NgĂ y sinh Ä‘á»‹nh dáº¡ng: YYYY-MM-DD (vĂ­ dá»¥: 2003-01-15)</li>
              <li>â€¢ Giá»›i tĂ­nh: nam, nu, hoáº·c khac</li>
              <li>â€¢ Táº£i xuá»‘ng file máº«u Ä‘á»ƒ xem Ä‘á»‹nh dáº¡ng chuáº©n</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">Chá»n file Excel hoáº·c CSV</p>
            <p className="text-sm text-gray-500">KĂ©o tháº£ file hoáº·c click Ä‘á»ƒ chá»n</p>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </label>
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={handleUploadPreview}
              disabled={!file || uploading}
              className="px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Äang táº£i vĂ  kiá»ƒm tra...' : 'Táº£i lĂªn Ä‘á»ƒ kiá»ƒm tra'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 flex flex-col items-center justify-center">
          <Download className="w-12 h-12 text-indigo-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">Táº£i file máº«u</p>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Táº£i xuá»‘ng file máº«u Excel vá»›i Ä‘á»‹nh dáº¡ng chuáº©n
          </p>
          <button
            onClick={downloadTemplate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Táº£i xuá»‘ng máº«u
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {uploading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Äang xá»­ lĂ½ file...</p>
        </div>
      )}

      {!uploading && previewData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Káº¿t quáº£ kiá»ƒm tra</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  Há»£p lá»‡: <span className="font-semibold text-green-600">{validationResults.valid.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-600">
                  KhĂ´ng há»£p lá»‡: <span className="font-semibold text-red-600">{validationResults.invalid.length}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tráº¡ng thĂ¡i</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">MSSV</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Há» tĂªn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lá»›p</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lá»—i</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className={row.errors ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      {row.errors ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.mssv || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.ho_ten || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.lop || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {row.errors && (
                        <div className="text-xs text-red-600">
                          {row.errors.map((err, i) => (
                            <div key={i}>â€¢ {err}</div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validationResults.valid.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">
                  Sáºµn sĂ ng import <span className="font-semibold">{validationResults.valid.length}</span> sinh viĂªn
                </span>
              </div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Äang import...' : 'Import sinh viĂªn'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
