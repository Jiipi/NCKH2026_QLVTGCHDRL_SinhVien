import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  Users,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';
import classesApi from '../../../services/classesApi';

type ImportRow = {
  mssv?: string;
  ho_ten?: string;
  email?: string;
  lop?: string;
  rowNumber?: number;
  errors?: string[];
};

type ImportJob = {
  id: string;
  filename: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_at: string;
};

const formatJobTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const statusLabel = (status: string) => ({
  pending: 'Chờ xác nhận',
  processing: 'Đang import',
  completed: 'Hoàn tất',
  failed: 'Thất bại'
}[status] || status);

export default function ImportStudents() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [validationResults, setValidationResults] = useState<{ valid: ImportRow[]; invalid: ImportRow[] }>({ valid: [], invalid: [] });
  const [previewJobId, setPreviewJobId] = useState('');
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadImportJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await classesApi.getImportJobs();
      setImportJobs(response.data || []);
    } catch (error) {
      console.error('Load import jobs error:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadImportJobs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      showError('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    setPreviewJobId('');
    setPreviewData([]);
    setValidationResults({ valid: [], invalid: [] });
  };

  const handleUploadPreview = async () => {
    if (!file) {
      showWarning('Vui lòng chọn file trước khi tải lên để kiểm tra');
      return;
    }

    setUploading(true);
    try {
      const response = await classesApi.previewImportStudents(file);
      const data = response.data || { valid: [], invalid: [], jobId: '' };
      setValidationResults({ valid: data.valid || [], invalid: data.invalid || [] });
      setPreviewData([...(data.valid || []), ...(data.invalid || [])]);
      setPreviewJobId(data.jobId || '');
      await loadImportJobs();
    } catch (err) {
      console.error('Parse error:', err);
      showError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!previewJobId) {
      showWarning('Vui lòng tải lên để kiểm tra trước khi import');
      return;
    }
    if (validationResults.valid.length === 0) {
      showWarning('Không có sinh viên hợp lệ để import');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn import ${validationResults.valid.length} sinh viên?`)) return;

    setImporting(true);
    try {
      const response = await classesApi.importStudents(null, previewJobId);
      showSuccess(`Import thành công ${response.data?.imported || 0} sinh viên`);
      await loadImportJobs();
      navigate('/teacher/students');
    } catch (err: any) {
      console.error('Import error:', err);
      showError(err.response?.data?.message || 'Không thể import sinh viên');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      let className = 'CTK46A';
      try {
        const list = await classesApi.getTeacherClasses();
        if (Array.isArray(list) && list.length > 0) {
          className = String(list[0].ten_lop || className);
        }
      } catch (_) {}

      const base = Date.now() % 10000000;
      const mssv1 = String(base).padStart(7, '0');
      const mssv2 = String((base + 1) % 10000000).padStart(7, '0');
      const template = `MSSV,Họ và tên,Email,Ngày sinh (YYYY-MM-DD),Giới tính (nam/nu/khac),Lớp,Số điện thoại,Địa chỉ,Tên đăng nhập,Mật khẩu\n${mssv1},Sinh Viên Mẫu A,sv${mssv1}@dlu.edu.vn,2003-01-15,nam,${className},0900000001,Địa chỉ 1,${mssv1},123456\n${mssv2},Sinh Viên Mẫu B,sv${mssv2}@dlu.edu.vn,2003-05-20,nu,${className},0900000002,Địa chỉ 2,${mssv2},123456`;

      const blob = new Blob(['﻿' + template], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'mau_import_sinh_vien.csv';
      link.click();
      showSuccess('Đã tải xuống file mẫu');
    } catch (_) {
      showError('Không thể tạo file mẫu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button onClick={() => navigate('/teacher/students')} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách
        </button>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Import sinh viên</h1>
        <p className="text-gray-600">Tải lên file Excel/CSV, xem preview lỗi từng dòng rồi xác nhận import.</p>
      </div>

      <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="mb-2 font-semibold text-blue-900">Hướng dẫn import</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• File Excel/CSV phải có các cột chuẩn để preview và validate</li>
              <li>• Hệ thống lưu lịch sử job import trước khi ghi DB</li>
              <li>• Import thật dùng `jobId` đã preview, không upload lại file lần 2</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-indigo-500">
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-semibold text-gray-700">Chọn file Excel hoặc CSV</p>
            <p className="text-sm text-gray-500">Kéo thả file hoặc click để chọn</p>
            {file && <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600"><FileSpreadsheet className="h-5 w-5" /><span className="font-medium">{file.name}</span></div>}
          </label>
          <button onClick={handleUploadPreview} disabled={!file || uploading} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {uploading ? 'Đang tải và kiểm tra...' : 'Tải lên để kiểm tra'}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
          <Download className="mb-4 h-12 w-12 text-indigo-600" />
          <p className="mb-2 text-lg font-semibold text-gray-900">Tải file mẫu</p>
          <p className="mb-4 text-center text-sm text-gray-600">Tải xuống file mẫu CSV với định dạng chuẩn</p>
          <button onClick={downloadTemplate} className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">Tải xuống mẫu</button>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Kết quả kiểm tra</h3>
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="h-5 w-5 text-green-600" />Hợp lệ: <b className="text-green-600">{validationResults.valid.length}</b></span>
              <span className="flex items-center gap-2 text-sm text-gray-600"><XCircle className="h-5 w-5 text-red-600" />Không hợp lệ: <b className="text-red-600">{validationResults.invalid.length}</b></span>
              {previewJobId && <span className="text-xs font-mono text-slate-500">Job: {previewJobId}</span>}
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Dòng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">MSSV</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Lớp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className={row.errors?.length ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}>
                    <td className="px-4 py-3">{row.errors?.length ? <XCircle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.rowNumber || index + 2}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.mssv || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.ho_ten || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.lop || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-red-600">{row.errors?.map((err, i) => <div key={i}>• {err}</div>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {validationResults.valid.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6">
              <span className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-5 w-5" />Sẵn sàng import <b>{validationResults.valid.length}</b> sinh viên</span>
              <button onClick={handleImport} disabled={importing || !previewJobId} className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{importing ? 'Đang import...' : 'Xác nhận import'}</button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử import</h3>
          <button onClick={loadImportJobs} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white">Làm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Tổng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Hợp lệ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Lỗi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Tạo lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingJobs ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Đang tải...</td></tr>
              ) : importJobs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có lịch sử import</td></tr>
              ) : importJobs.map((job) => (
                <tr key={job.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{job.filename}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{statusLabel(job.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.total_rows}</td>
                  <td className="px-4 py-3 text-sm text-green-700">{job.valid_rows}</td>
                  <td className="px-4 py-3 text-sm text-red-700">{job.invalid_rows}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatJobTime(job.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
