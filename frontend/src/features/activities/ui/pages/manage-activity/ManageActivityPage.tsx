import React from 'react';
import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ClipboardList, GraduationCap, Info, Layers3, Lock } from 'lucide-react';
import { useManageActivity } from '../../../model/hooks/useManageActivity';
import { getSemesterLabel } from '../../../../../shared/lib/semester';
import { ActivityForm } from '../../shared/ActivityForm';
import Header from '../../../../../shared/components/layout/Header';
import ClassManagementLayout from '../../../../../shared/components/layout/ClassManagementLayout';
import { LoadingSpinner } from '../../../../../shared/components/common';
import { StudentPageHero } from '../../../../../shared/components/student';

function formatSemesterDisplay(semesterValue: string): string {
  if (!semesterValue) return 'Chưa chọn học kỳ';
  const label = getSemesterLabel(semesterValue);
  if (label && label !== semesterValue) return label;
  const match = semesterValue.match(/hoc_ky_([12])[_-](\d{4})/);
  if (match) return `Học kỳ ${match[1]} - ${match[2]}`;
  return semesterValue;
}

const ManageActivityPage: FC = () => {
  const location = useLocation();
  const {
    isEditMode,
    form,
    activityTypes,
    status,
    fieldErrors,
    handleFormChange,
    handleArrayFieldChange,
    handleSubmit,
    semesterOptions,
    currentSemesterValue,
    handleSemesterChange,
    isWritable,
    currentSemester,
  } = useManageActivity();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMonitorRoute = location.pathname.startsWith('/monitor') || location.pathname.startsWith('/class');
  const semesterLabel = formatSemesterDisplay(currentSemesterValue);
  const currentSemesterLabel = formatSemesterDisplay(currentSemester || '');
  const disabled = status.submitting || false;

  const title = isEditMode
    ? 'Chỉnh sửa hoạt động'
    : isMonitorRoute
      ? 'Tạo hoạt động lớp'
      : 'Tạo hoạt động rèn luyện';

  const subtitle = isMonitorRoute
    ? 'Hoạt động do lớp trưởng tạo sẽ gắn vào lớp hiện tại và chờ giảng viên hoặc quản trị viên duyệt.'
    : isAdminRoute
      ? 'Tạo hoạt động cấp hệ thống, cấu hình học kỳ, thời gian, điểm rèn luyện và điều kiện điểm danh.'
      : 'Tạo hoạt động cho lớp phụ trách, sau đó theo dõi đăng ký và điểm danh.';

  const legacyHeroHeader = (
    <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 shadow-sm backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400" />
      <div className="grid gap-6 px-5 py-6 md:grid-cols-[1fr_auto] md:px-7">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
            {isMonitorRoute ? <GraduationCap className="h-7 w-7" /> : <ClipboardList className="h-7 w-7" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {isEditMode ? 'Cập nhật thông tin' : 'Biểu mẫu hoạt động'}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm md:min-w-[260px]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-700">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{semesterLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{isEditMode ? 'Sẵn sàng lưu thay đổi' : 'Trạng thái sau tạo: Chờ duyệt'}</span>
          </div>
        </div>
      </div>
    </section>
  );

  const heroHeader = isMonitorRoute ? (
    <StudentPageHero
      eyebrow="Không gian lớp trưởng"
      title={title}
      description={subtitle}
      heroIcon={GraduationCap}
      chips={[
        { icon: CalendarDays, label: semesterLabel },
        { icon: CheckCircle2, label: isEditMode ? 'Sẵn sàng lưu thay đổi' : 'Trạng thái sau tạo: Chờ duyệt' },
      ]}
    />
  ) : legacyHeroHeader;

  const semesterWarningBanner = !isWritable ? (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
      <Lock className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Học kỳ đang chọn khác học kỳ hiện hành</p>
        <p className="text-sm">Học kỳ hiện hành: {currentSemesterLabel}. Kiểm tra kỹ trước khi lưu hoạt động.</p>
      </div>
    </div>
  ) : null;

  const monitorNotice = isMonitorRoute ? (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-800">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Luồng lớp trưởng</p>
          <p>Hệ thống tự xác định lớp từ tài khoản lớp trưởng. Bạn không cần chọn lớp thủ công.</p>
        </div>
      </div>
    </div>
  ) : null;

  const formSection = (
    <section className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Layers3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Thông tin hoạt động</h2>
          <p className="text-sm text-slate-500">Nhập đầy đủ các trường bắt buộc để gửi duyệt.</p>
        </div>
      </div>

      {status.loading ? (
        <LoadingSpinner text="Đang tải dữ liệu..." />
      ) : (
        <ActivityForm
          form={form}
          activityTypes={activityTypes}
          onFormChange={handleFormChange}
          onArrayFieldChange={handleArrayFieldChange}
          onSubmit={handleSubmit}
          fieldErrors={fieldErrors}
          status={status}
          isEditMode={isEditMode}
          semesterOptions={semesterOptions}
          currentSemesterValue={currentSemesterValue}
          onSemesterChange={handleSemesterChange}
          disabled={disabled}
        />
      )}
    </section>
  );

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-6xl space-y-6 p-6">
          {heroHeader}
          {semesterWarningBanner}
          {formSection}
        </main>
      </div>
    );
  }

  if (isMonitorRoute) {
    return (
      <div className="space-y-6">
        {heroHeader}
        {semesterWarningBanner}
        {monitorNotice}
        {formSection}
      </div>
    );
  }

  return (
    <ClassManagementLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {heroHeader}
        {semesterWarningBanner}
        {formSection}
      </div>
    </ClassManagementLayout>
  );
};

export default ManageActivityPage;
