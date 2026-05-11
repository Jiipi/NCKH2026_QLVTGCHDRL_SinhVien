/**
 * Activity Types Management Page (Tier 1: UI Layer)
 * ==================================================
 * Single Responsibility: Orchestrate activity type UI components
 */

import { useState, useMemo, useEffect } from 'react';
import type { FC, FormEvent, ReactNode } from 'react';
import { useActivityTypes } from '../../../model';
import type { ActivityTypeItem, ActivityTypePayload } from '../../../model';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';
import ActivityTypeHeader from '../../shared/ActivityTypeHeader';
import ActivityTypeFilters from '../../shared/ActivityTypeFilters';
import ActivityTypeGrid from '../../shared/ActivityTypeGrid';
import ActivityTypeList from '../../shared/ActivityTypeList';
import ActivityTypeEmptyState from '../../shared/ActivityTypeEmptyState';
import ActivityTypeModal from '../../shared/ActivityTypeModal';
import ActivityTypeLoadingState from '../../shared/ActivityTypeLoadingState';

interface ActivityTypesManagementPageProps {
  showHeader?: boolean;
}

interface FormState {
  id: string | null;
  ten_loai_hd: string;
  mo_ta: string;
  diem_mac_dinh: number;
  diem_toi_da: number;
  mau_sac: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name';

const ActivityTypesManagementPage: FC<ActivityTypesManagementPageProps> = ({ showHeader = true }) => {
  const { items, loading, create, update, remove } = useActivityTypes();
  const { showSuccess, showError, confirm } = useNotification();
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [form, setForm] = useState<FormState>({
    id: null,
    ten_loai_hd: '',
    mo_ta: '',
    diem_mac_dinh: 0,
    diem_toi_da: 10,
    mau_sac: '#3B82F6'
  });

  useEffect(() => {
    const handleOpenModal = (): void => openCreateModal();
    window.addEventListener('openActivityTypeModal', handleOpenModal);
    return () => window.removeEventListener('openActivityTypeModal', handleOpenModal);
  }, []);

  function resetForm(): void {
    setForm({
      id: null,
      ten_loai_hd: '',
      mo_ta: '',
      diem_mac_dinh: 0,
      diem_toi_da: 10,
      mau_sac: '#3B82F6'
    });
    setShowModal(false);
  }

  function openCreateModal(): void {
    resetForm();
    setShowModal(true);
  }

  async function submit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!form.ten_loai_hd.trim()) {
      showError('Nhập tên loại');
      return;
    }
    try {
      const payload: ActivityTypePayload = {
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError(error?.response?.data?.message || error?.message || 'Lỗi');
    }
  }

  async function removeItem(id: string): Promise<void> {
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError(error?.response?.data?.message || error?.message || 'Không thể xóa');
    }
  }

  function edit(item: ActivityTypeItem): void {
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

  const filtered = useMemo<ActivityTypeItem[]>(() => {
    return items.filter(it => !search || (it.ten_loai_hd || '').toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const sorted = useMemo<ActivityTypeItem[]>(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.ngay_tao || 0).getTime() - new Date(b.ngay_tao || 0).getTime();
      }
      if (sortBy === 'name') {
        return (a.ten_loai_hd || '').localeCompare(b.ten_loai_hd || '', 'vi');
      }
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
};

export default ActivityTypesManagementPage;
