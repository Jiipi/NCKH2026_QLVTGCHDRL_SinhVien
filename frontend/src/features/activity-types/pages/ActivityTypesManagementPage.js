import React from 'react';
import { Plus, Edit2, Trash2, Search, Tag, FileText, Award, Palette, X, Check, Filter, Grid3x3, List, TrendingUp } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useActivityTypes } from '../model/useActivityTypes';

// Hủy bỏ chọn/tải ảnh: chuyển sang chọn màu (mau_sac)

export default function ActivityTypesManagementPage() {
  const { items, loading, create, update, remove } = useActivityTypes();
  const { showSuccess, showError, confirm } = useNotification();
  const [search, setSearch] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('grid');
  const [sortBy, setSortBy] = React.useState('newest');
  const [form, setForm] = React.useState({ id:null, ten_loai_hd:'', mo_ta:'', diem_mac_dinh:0, diem_toi_da:10, mau_sac:'#3B82F6' });

  React.useEffect(() => {
    const handleOpenModal = () => openCreateModal();
    window.addEventListener('openActivityTypeModal', handleOpenModal);
    return () => window.removeEventListener('openActivityTypeModal', handleOpenModal);
  }, []);

  function resetForm(){ setForm({ id:null, ten_loai_hd:'', mo_ta:'', diem_mac_dinh:0, diem_toi_da:10, mau_sac:'#3B82F6' }); setShowModal(false); }
  function openCreateModal(){ resetForm(); setShowModal(true); }
  
  async function submit(e){
    e.preventDefault();
    if(!form.ten_loai_hd.trim()){ showError('Nhập tên loại'); return; }
    try {
      const payload={
        ten_loai_hd:form.ten_loai_hd,
        mo_ta:form.mo_ta,
        diem_mac_dinh:form.diem_mac_dinh,
        diem_toi_da:form.diem_toi_da,
        mau_sac:form.mau_sac
      };
      if(form.id){ await update(form.id, payload); showSuccess('Cập nhật thành công'); }
      else { await create(payload); showSuccess('Tạo thành công'); }
      resetForm();
    } catch(err){ showError(err?.response?.data?.message || err.message || 'Lỗi'); }
  }

  async function removeItem(id){ const ok=await confirm({ title:'Xóa?', message:'Xóa loại hoạt động này?', confirmText:'Xóa', cancelText:'Hủy' }); if(!ok) return; try { await remove(id); showSuccess('Đã xóa'); } catch(err){ showError(err?.response?.data?.message || err.message || 'Không thể xóa'); } }

  function edit(item){ setForm({ id:item.id, ten_loai_hd:item.ten_loai_hd||'', mo_ta:item.mo_ta||'', diem_mac_dinh:item.diem_mac_dinh||0, diem_toi_da:item.diem_toi_da||10, mau_sac:item.mau_sac||'#3B82F6' }); setShowModal(true); }

  const filtered = items.filter(it => !search || (it.ten_loai_hd||'').toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a,b)=> { if(sortBy==='newest') return new Date(b.ngay_tao)-new Date(a.ngay_tao); if(sortBy==='oldest') return new Date(a.ngay_tao)-new Date(b.ngay_tao); if(sortBy==='name') return (a.ten_loai_hd||'').localeCompare(b.ten_loai_hd||''); return 0; });

  const stats = { total: items.length };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="space-y-6">

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input placeholder="Tìm kiếm theo tên loại hoạt động..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white font-medium" /></div>
            <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white font-medium cursor-pointer appearance-none"><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="name">Tên A-Z</option></select></div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl"><button onClick={()=>setViewMode('grid')} className={`p-3 rounded-lg transition-all ${viewMode==='grid'?'bg-white shadow-md text-indigo-600':'text-gray-500 hover:text-gray-700'}`}><Grid3x3 className="h-5 w-5" /></button><button onClick={()=>setViewMode('list')} className={`p-3 rounded-lg transition-all ${viewMode==='list'?'bg-white shadow-md text-indigo-600':'text-gray-500 hover:text-gray-700'}`}><List className="h-5 w-5" /></button></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200"><p className="text-sm text-gray-600">Hiển thị <span className="font-bold text-indigo-600">{sorted.length}</span> / <span className="font-bold text-indigo-600">{stats.total}</span></p></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96"><div className="relative"><div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div><div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div></div></div>
        ) : viewMode==='grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(item => (
              <div key={item.id} className="group relative bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="relative w-full h-36 overflow-hidden" style={{ backgroundColor: item.mau_sac || '#EEF2FF' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">{item.ten_loai_hd}</h3>
                  <div><p className="text-xs text-gray-600 line-clamp-2">{item.mo_ta || 'Phẩm chất công dân'}</p></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100"><div className="flex items-center gap-1 mb-0.5"><Award className="h-3 w-3 text-indigo-600" /><span className="text-xs text-gray-600 font-medium">Mặc định</span></div><p className="text-lg font-black text-indigo-600">{item.diem_mac_dinh || 0}</p></div>
                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100"><div className="flex items-center gap-1 mb-0.5"><Award className="h-3 w-3 text-emerald-600" /><span className="text-xs text-gray-600 font-medium">Tối đa</span></div><p className="text-lg font-black text-emerald-600">{item.diem_toi_da || 10}</p></div>
                  </div>
                </div>
                <div className="p-3 pt-0 flex gap-2"><button onClick={()=>edit(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg text-xs font-semibold"><Edit2 className="h-3.5 w-3.5" />Sửa</button><button onClick={()=>removeItem(item.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-md hover:shadow-lg text-xs font-semibold"><Trash2 className="h-3.5 w-3.5" />Xóa</button></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(item => (
              <div key={item.id} className="group relative bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="flex flex-row">
                  <div className="relative w-32 h-24 overflow-hidden flex-shrink-0" style={{ backgroundColor: item.mau_sac || '#EEF2FF' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-between min-w-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.ten_loai_hd}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.mo_ta || 'Phẩm chất công dân'}</p>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100"><Award className="h-3.5 w-3.5 text-indigo-600" /><span className="text-xs text-gray-600 font-medium">Mặc định:</span><span className="text-sm font-bold text-indigo-600">{item.diem_mac_dinh || 0}</span></div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100"><Award className="h-3.5 w-3.5 text-emerald-600" /><span className="text-xs text-gray-600 font-medium">Tối đa:</span><span className="text-sm font-bold text-emerald-600">{item.diem_toi_da || 10}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0 ml-4"><button onClick={()=>edit(item)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg text-sm font-semibold min-w-[90px]"><Edit2 className="h-4 w-4" />Sửa</button><button onClick={()=>removeItem(item.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-md hover:shadow-lg text-sm font-semibold min-w-[90px]"><Trash2 className="h-4 w-4" />Xóa</button></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length===0 && !loading && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto"><Tag className="h-16 w-16 text-indigo-600" /></div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"><Plus className="h-6 w-6 text-white" /></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{search ? 'Không tìm thấy kết quả' : 'Chưa có loại hoạt động nào'}</h3>
              <p className="text-gray-600 text-lg mb-8">{search ? `Không tìm thấy loại hoạt động nào khớp với "${search}"` : 'Hãy tạo loại hoạt động đầu tiên để bắt đầu phân loại các hoạt động rèn luyện'}</p>
              {!search && (<button onClick={openCreateModal} className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold text-lg"><Plus className="h-6 w-6" />Tạo loại hoạt động mới</button>)}
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl flex items-center justify-between"><h2 className="text-2xl font-bold">{form.id?'Chỉnh sửa loại hoạt động':'Tạo loại hoạt động mới'}</h2><button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-xl"><X className="h-6 w-6" /></button></div>
              <form onSubmit={submit} className="p-6 space-y-6">
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Tag className="h-4 w-4 text-indigo-600" />Tên loại hoạt động<span className="text-rose-500">*</span></label><input value={form.ten_loai_hd} onChange={e=>setForm(f=>({...f, ten_loai_hd:e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="Ví dụ: Đoàn - Hội" /></div>
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><FileText className="h-4 w-4 text-indigo-600" />Mô tả</label><textarea value={form.mo_ta} onChange={e=>setForm(f=>({...f, mo_ta:e.target.value}))} rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Mô tả chi tiết..." /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Award className="h-4 w-4 text-indigo-600" />Điểm mặc định</label><input type="number" step="0.01" min="0" value={form.diem_mac_dinh} onChange={e=>setForm(f=>({...f, diem_mac_dinh:parseFloat(e.target.value)||0}))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div><div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Award className="h-4 w-4 text-emerald-600" />Điểm tối đa</label><input type="number" step="0.01" min="0" value={form.diem_toi_da} onChange={e=>setForm(f=>({...f, diem_toi_da:parseFloat(e.target.value)||0}))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" /></div></div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"><Palette className="h-4 w-4 text-indigo-600" />Màu sắc</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.mau_sac} onChange={e=>setForm(f=>({...f, mau_sac:e.target.value}))} className="h-10 w-16 p-1 border-2 border-gray-200 rounded-lg cursor-pointer" />
                    <input type="text" value={form.mau_sac} onChange={e=>setForm(f=>({...f, mau_sac:e.target.value}))} className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg" placeholder="#3B82F6" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100"><p className="text-sm font-semibold text-gray-700 mb-3">Xem trước:</p><div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200"><div className="h-40 flex items-center justify-center p-4" style={{ backgroundColor: form.mau_sac || '#EEF2FF' }}><div className="text-white font-semibold drop-shadow">{form.ten_loai_hd || 'Tên loại hoạt động'}</div></div><div className="p-4"><h4 className="font-bold text-gray-900 mb-1">{form.ten_loai_hd || 'Tên loại hoạt động'}</h4><p className="text-sm text-gray-600 mb-3">{form.mo_ta || 'Mô tả loại hoạt động'}</p><div className="flex gap-2"><span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">{form.diem_mac_dinh} điểm mặc định</span><span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">{form.diem_toi_da} điểm tối đa</span></div></div></div></div>
                <div className="flex gap-3 pt-4"><button type="button" onClick={resetForm} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold">Hủy</button><button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg font-semibold disabled:opacity-50"><Check className="h-5 w-5" />{form.id?'Cập nhật':'Tạo mới'}</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
