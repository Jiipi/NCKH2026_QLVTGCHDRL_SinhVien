/**
 * Activity Types Management Page (Tier 1: UI Layer)
 * ==================================================
 * Single Responsibility: Orchestrate activity type UI components
 */

import React, { useState, useMemo } from 'react';
import { useActivityTypes } from '../model/useActivityTypes';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import {
  ActivityTypeHeader,
  ActivityTypeFilters,
  ActivityTypeGrid,
  ActivityTypeList,
  ActivityTypeEmptyState,
  ActivityTypeModal,
  ActivityTypeLoadingState
} from './components';

export default function ActivityTypesManagementPage({ showHeader = true }) {
  const { items, loading, create, update, remove } = useActivityTypes();
  const { showSuccess, showError, confirm } = useNotification();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [form, setForm] = useState({ id: null, ten_loai_hd: '', mo_ta: '', diem_mac_dinh: 0, diem_toi_da: 10, mau_sac: '#3B82F6' });

  React.useEffect(() => {
    const handleOpenModal = () => openCreateModal();
    window.addEventListener('openActivityTypeModal', handleOpenModal);
    return () => window.removeEventListener('openActivityTypeModal', handleOpenModal);
  }, []);

  function resetForm() {
    setForm({ id: null, ten_loai_hd: '', mo_ta: '', diem_mac_dinh: 0, diem_toi_da: 10, mau_sac: '#3B82F6' });
    setShowModal(false);
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.ten_loai_hd.trim()) {
      showError('Nhập tên loại');
      return;
    }
    try {
      const payload = {
        ten_loai_hd: form.ten_loai_hd,
        mo_ta: form.mo_ta,
        diem_mac_dinh: form.diem_mac_dinh,
        diem_toi_da: form.diem_toi_da,
        mau_sac: form.mau_sac
      };
      if (form.id) {
        await update(form.id, payload);
        showSuccess('Cập nhật thành công');
      } else {
        await create(payload);
        showSuccess('Tạo thành công');
      }
      resetForm();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Lỗi');
    }
  }

  async function removeItem(id) {
    const ok = await confirm({
      title: 'Xóa?',
      message: 'Xóa loại hoạt động này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    if (!ok) return;
    try {
      await remove(id);
      showSuccess('Đã xóa');
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Không thể xóa');
    }
  }

  function edit(item) {
    setForm({
      id: item.id,
      ten_loai_hd: item.ten_loai_hd || '',
      mo_ta: item.mo_ta || '',
      diem_mac_dinh: item.diem_mac_dinh || 0,
      diem_toi_da: item.diem_toi_da || 10,
      mau_sac: item.mau_sac || '#3B82F6'
    });
    setShowModal(true);
  }

  const filtered = useMemo(() => {
    return items.filter(it => !search || (it.ten_loai_hd || '').toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.ngay_tao) - new Date(a.ngay_tao);
      if (sortBy === 'oldest') return new Date(a.ngay_tao) - new Date(b.ngay_tao);
      if (sortBy === 'name') return (a.ten_loai_hd || '').localeCompare(b.ten_loai_hd || '');
      return 0;
    });
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="space-y-6">
        {showHeader && (
          <ActivityTypeHeader
            onCreateClick={openCreateModal}
            loading={loading}
            totalCount={items.length}
          />
        )}

        <ActivityTypeFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          total={items.length}
          filtered={sorted.length}
        />

        {loading ? (
          <ActivityTypeLoadingState />
        ) : viewMode === 'grid' ? (
          <ActivityTypeGrid items={sorted} onEdit={edit} onRemove={removeItem} />
        ) : (
          <ActivityTypeList items={sorted} onEdit={edit} onRemove={removeItem} />
        )}

        {filtered.length === 0 && !loading && (
          <ActivityTypeEmptyState search={search} onCreateClick={openCreateModal} />
        )}

        <ActivityTypeModal
          show={showModal}
          form={form}
          onFormChange={setForm}
          onSubmit={submit}
          onClose={resetForm}
          loading={loading}
        />
      </div>
    </div>
  );
}
