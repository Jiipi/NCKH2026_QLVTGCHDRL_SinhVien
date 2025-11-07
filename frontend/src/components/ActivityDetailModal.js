import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Users, Award, UserPlus, Eye, AlertCircle, CheckCircle, Info } from 'lucide-react';
import http from '../services/http';
import { useNotification } from '../contexts/NotificationContext';
import { getActivityImage } from '../utils/activityImages';

export default function ActivityDetailModal({ activityId, isOpen, onClose }) {
  const { showSuccess, showError, confirm } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current user role (robust across shapes), always UPPERCASE
  const getCurrentUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Try multiple shapes: string, object.ten_vt, or other common fields
        let roleValue = null;
        if (typeof user?.vai_tro === 'string') {
          roleValue = user.vai_tro;
        } else if (user?.vai_tro && typeof user.vai_tro === 'object' && user.vai_tro.ten_vt) {
          roleValue = user.vai_tro.ten_vt;
        } else if (user?.ten_vt) {
          roleValue = user.ten_vt;
        } else if (user?.role) {
          roleValue = user.role;
        }
        const normalized = String(roleValue || '').toUpperCase().trim();
        // Debug once for verification (can be removed later)
        console.debug('ActivityDetailModal role:', normalized);
        return normalized || null;
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
    return null;
  };

  const userRole = getCurrentUserRole();

  useEffect(() => {
    if (isOpen && activityId) {
      loadActivityDetail();
    }
  }, [isOpen, activityId]);

  async function loadActivityDetail() {
    setLoading(true);
    setError('');
    try {
      const res = await http.get(`/activities/${activityId}`);
      setData(res.data?.data || null);
    } catch (err) {
      setError('Không thể tải chi tiết hoạt động');
      console.error('Load activity detail error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!data) return;
    
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${data.ten_hd}"?`,
      confirmText: 'Đăng ký',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      const res = await http.post(`/activities/${activityId}/register`);
      if (res.data?.success) {
        showSuccess('Đăng ký thành công', 'Thành công', 12000);
        // Reload data to update registration status
        loadActivityDetail();
      } else {
        showSuccess(res.data?.message || 'Đăng ký thành công', 'Thông báo', 10000);
        loadActivityDetail();
      }
    } catch (err) {
      const firstValidation = err?.response?.data?.errors?.[0]?.message;
      const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      showError(errorMsg);
    }
  }

  if (!isOpen) return null;

  const start = data?.ngay_bd ? new Date(data.ngay_bd) : null;
  const end = data?.ngay_kt ? new Date(data.ngay_kt) : null;
  const deadline = data?.han_dk ? new Date(data.han_dk) : null;
  const now = new Date();
  
  const withinTime = start && end ? (start <= now && end >= now) || start > now : true;
  const isDeadlinePast = deadline ? deadline < now : false;
  
  // Only allow students and class leaders to register, not teachers
  // Role values in database are uppercase: GIANG_VIEN, SINH_VIEN, LOP_TRUONG
  const pathname = typeof window !== 'undefined' ? (window.location?.pathname || '') : '';
  const inTeacherContext = pathname.startsWith('/teacher');
  const isTeacher = userRole === 'GIANG_VIEN' || inTeacherContext;
  const canRegister = !isTeacher && data?.trang_thai === 'da_duyet' && withinTime && 
    (!data?.is_registered || data?.registration_status === 'tu_choi') && !isDeadlinePast;

  // Lightweight debug (can be removed later)
  console.debug('ActivityDetailModal flags:', { isTeacher, inTeacherContext, canRegister });

  const getStatusInfo = () => {
    if (data?.is_registered) {
      if (data.registration_status === 'da_duyet') {
        return { label: 'Đã đăng ký (Đã duyệt)', color: 'bg-green-100 text-green-800 border-green-200' };
      } else if (data.registration_status === 'tu_choi') {
        return { label: 'Bị từ chối', color: 'bg-red-100 text-red-800 border-red-200' };
      } else if (data.registration_status === 'da_tham_gia') {
        return { label: 'Đã tham gia', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      } else {
        return { label: 'Đã đăng ký (Chờ duyệt)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      }
    } else if (isDeadlinePast) {
      return { label: 'Đã quá hạn đăng ký', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (data?.trang_thai === 'da_duyet') {
      return { label: 'Có thể đăng ký', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { label: 'Chưa được duyệt', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo();

  return React.createElement(
    'div',
    { 
      className: 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center',
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      }
    },
    React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen w-full px-4 py-6' },
      [
        // Backdrop
        React.createElement(
          'div',
          { 
            key: 'backdrop',
            className: 'fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity',
            onClick: onClose
          }
        ),
        
        // Modal - Optimized size
        React.createElement(
          'div',
          { 
            key: 'modal',
            className: 'relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-3xl max-h-[90vh] flex flex-col'
          },
          [
            // Header - Compact and modern
            React.createElement(
              'div',
              { key: 'header', className: 'flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 border-b border-blue-700' },
              [
                React.createElement(
                  'div',
                  { key: 'header-content', className: 'flex items-center justify-between' },
                  [
                    React.createElement('h3', { 
                      key: 'title', 
                      className: 'text-xl font-bold text-white flex items-center gap-2' 
                    }, [
                      React.createElement(Eye, { key: 'icon', className: 'h-5 w-5' }),
                      'Chi tiết hoạt động'
                    ]),
                    React.createElement(
                      'button',
                      {
                        key: 'close',
                        onClick: onClose,
                        className: 'text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg p-2'
                      },
                      React.createElement(X, { className: 'h-5 w-5' })
                    )
                  ]
                )
              ]
            ),
            
            // Content - Optimized scrolling
            React.createElement(
              'div',
              { key: 'content', className: 'flex-1 bg-white px-6 py-5 overflow-y-auto' },
              loading ? (
                React.createElement(
                  'div',
                  { key: 'loading', className: 'flex items-center justify-center py-8' },
                  [
                    React.createElement(
                      'div',
                      { key: 'spinner', className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }
                    ),
                    React.createElement('span', { 
                      key: 'text', 
                      className: 'ml-3 text-gray-600' 
                    }, 'Đang tải...')
                  ]
                )
              ) : error ? (
                React.createElement(
                  'div',
                  { key: 'error', className: 'flex items-center justify-center py-8 text-red-600' },
                  [
                    React.createElement(AlertCircle, { key: 'icon', className: 'h-6 w-6 mr-2' }),
                    error
                  ]
                )
              ) : data ? [
                // Activity Image - Compact version
                React.createElement(
                  'div',
                  { key: 'image', className: 'mb-5 -mx-6 -mt-5' },
                  React.createElement('img', {
                    src: getActivityImage(data.hinh_anh, data.loai_hd?.ten_loai),
                    alt: data.ten_hd || 'Poster hoạt động',
                    className: 'w-full h-48 object-cover',
                    onError: (e) => {
                      // Fallback to default image if image fails to load
                      e.target.src = '/images/default-activity.jpg';
                    }
                  })
                ),
                
                // Activity Title and Status - Combined
                React.createElement(
                  'div',
                  { key: 'title-section', className: 'mb-5 px-6' },
                  [
                    React.createElement(
                      'h2',
                      { key: 'activity-title', className: 'text-2xl font-bold text-gray-900 mb-3' },
                      data.ten_hd || 'Hoạt động'
                    ),
                    React.createElement(
                      'div',
                      { key: 'status-badges', className: 'flex items-center gap-2 flex-wrap' },
                      [
                        React.createElement('span', {
                          key: 'status',
                          className: `inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${statusInfo.color}`
                        }, [
                          React.createElement('div', { 
                            key: 'dot',
                            className: `w-2 h-2 rounded-full mr-2 ${
                              data?.is_registered ? 'bg-green-500' : 
                              isDeadlinePast ? 'bg-red-500' : 
                              'bg-blue-500'
                            }`
                          }),
                          statusInfo.label
                        ]),
                        React.createElement('span', {
                          key: 'points',
                          className: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-600'
                        }, [
                          React.createElement(Award, { key: 'icon', className: 'h-4 w-4' }),
                          `+${data.diem_rl || 0} điểm`
                        ])
                      ]
                    )
                  ]
                ),
                
                // Description
                React.createElement(
                  'div',
                  { key: 'description', className: 'mb-5 px-6 py-4 bg-blue-50 rounded-xl border border-blue-100' },
                  [
                    React.createElement('h4', { 
                      key: 'desc-title', 
                      className: 'text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide flex items-center gap-2' 
                    }, [
                      React.createElement(Info, { key: 'icon', className: 'h-4 w-4' }),
                      'Mô tả hoạt động'
                    ]),
                    React.createElement('p', { 
                      key: 'desc-content', 
                      className: 'text-gray-700 leading-relaxed text-sm' 
                    }, data.mo_ta || 'Chưa có mô tả')
                  ]
                ),
                
                // Activity Details Grid - Compact
                React.createElement(
                  'div',
                  { key: 'details', className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 px-6' },
                  [
                    React.createElement(
                      'div',
                      { key: 'type', className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                      [
                        React.createElement(
                          'div',
                          { key: 'icon-wrapper', className: 'flex-shrink-0 p-2 bg-blue-100 rounded-lg' },
                          React.createElement(Calendar, { 
                            key: 'icon', 
                            className: 'h-5 w-5 text-blue-600' 
                          })
                        ),
                        React.createElement('div', { key: 'content', className: 'flex-1 min-w-0' }, [
                          React.createElement('span', { 
                            key: 'label', 
                            className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide block' 
                          }, 'Loại hoạt động'),
                          React.createElement('p', { 
                            key: 'value', 
                            className: 'text-sm font-semibold text-gray-900 mt-0.5 truncate' 
                          }, data.loai || data.loai_hd?.ten_loai_hd || 'Chưa xác định')
                        ])
                      ]
                    ),
                    
                    React.createElement(
                      'div',
                      { key: 'time', className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                      [
                        React.createElement(
                          'div',
                          { key: 'icon-wrapper', className: 'flex-shrink-0 p-2 bg-green-100 rounded-lg' },
                          React.createElement(Clock, { 
                            key: 'icon', 
                            className: 'h-5 w-5 text-green-600' 
                          })
                        ),
                        React.createElement('div', { key: 'content', className: 'flex-1 min-w-0' }, [
                          React.createElement('span', { 
                            key: 'label', 
                            className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide block' 
                          }, 'Thời gian'),
                          React.createElement('p', { 
                            key: 'value', 
                            className: 'text-sm font-semibold text-gray-900 mt-0.5' 
                          }, start ? start.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa xác định'),
                          end && React.createElement('p', { 
                            key: 'end', 
                            className: 'text-xs text-gray-600 mt-0.5' 
                          }, `→ ${end.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}`)
                        ])
                      ]
                    ),
                    
                    React.createElement(
                      'div',
                      { key: 'location', className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                      [
                        React.createElement(
                          'div',
                          { key: 'icon-wrapper', className: 'flex-shrink-0 p-2 bg-purple-100 rounded-lg' },
                          React.createElement(MapPin, { 
                            key: 'icon', 
                            className: 'h-5 w-5 text-purple-600' 
                          })
                        ),
                        React.createElement('div', { key: 'content', className: 'flex-1 min-w-0' }, [
                          React.createElement('span', { 
                            key: 'label', 
                            className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide block' 
                          }, 'Địa điểm'),
                          React.createElement('p', { 
                            key: 'value', 
                            className: 'text-sm font-semibold text-gray-900 mt-0.5 truncate' 
                          }, data.dia_diem || 'Chưa xác định')
                        ])
                      ]
                    ),
                    
                    React.createElement(
                      'div',
                      { key: 'capacity', className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                      [
                        React.createElement(
                          'div',
                          { key: 'icon-wrapper', className: 'flex-shrink-0 p-2 bg-orange-100 rounded-lg' },
                          React.createElement(Users, { 
                            key: 'icon', 
                            className: 'h-5 w-5 text-orange-600' 
                          })
                        ),
                        React.createElement('div', { key: 'content', className: 'flex-1 min-w-0' }, [
                          React.createElement('span', { 
                            key: 'label', 
                            className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide block' 
                          }, 'Số lượng tối đa'),
                          React.createElement('p', { 
                            key: 'value', 
                            className: 'text-sm font-semibold text-gray-900 mt-0.5' 
                          }, `${data.sl_toi_da || 0} người`)
                        ])
                      ]
                    ),
                    
                    React.createElement(
                      'div',
                      { key: 'organizer', className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                      [
                        React.createElement(
                          'div',
                          { key: 'icon-wrapper', className: 'flex-shrink-0 p-2 bg-indigo-100 rounded-lg' },
                          React.createElement(Users, { 
                            key: 'icon', 
                            className: 'h-5 w-5 text-indigo-600' 
                          })
                        ),
                        React.createElement('div', { key: 'content', className: 'flex-1 min-w-0' }, [
                          React.createElement('span', { 
                            key: 'label', 
                            className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide block' 
                          }, 'Đơn vị tổ chức'),
                          React.createElement('p', { 
                            key: 'value', 
                            className: 'text-sm font-semibold text-gray-900 mt-0.5 truncate' 
                          }, data.don_vi_to_chuc || 'Nhà trường')
                        ])
                      ]
                    )
                  ]
                ),
                
                // Deadline info - Compact
                deadline && React.createElement(
                  'div',
                  { key: 'deadline', className: 'mb-4 mx-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg' },
                  [
                    React.createElement('div', { 
                      key: 'deadline-content', 
                      className: 'flex items-center gap-2' 
                    }, [
                      React.createElement(AlertCircle, { 
                        key: 'icon', 
                        className: 'h-5 w-5 text-yellow-600 flex-shrink-0' 
                      }),
                      React.createElement('div', { key: 'text', className: 'flex-1' }, [
                        React.createElement('span', { 
                          key: 'label', 
                          className: 'text-xs font-bold text-yellow-800 uppercase tracking-wide' 
                        }, 'Hạn đăng ký: '),
                        React.createElement('span', { 
                          key: 'value', 
                          className: 'text-sm font-semibold text-yellow-900' 
                        }, deadline.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }))
                      ])
                    ])
                  ]
                ),
                
                // Rejection reason - Compact
                data?.registration_status === 'tu_choi' && data?.rejection_reason && React.createElement(
                  'div',
                  { key: 'rejection', className: 'mb-4 mx-6 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg' },
                  [
                    React.createElement('div', { 
                      key: 'rejection-header', 
                      className: 'flex items-start gap-2' 
                    }, [
                      React.createElement(AlertCircle, { 
                        key: 'icon', 
                        className: 'h-5 w-5 text-red-600 flex-shrink-0 mt-0.5' 
                      }),
                      React.createElement('div', { key: 'content', className: 'flex-1' }, [
                        React.createElement('p', { 
                          key: 'label', 
                          className: 'text-xs font-bold text-red-800 mb-1 uppercase tracking-wide' 
                        }, 'Lý do từ chối:'),
                        React.createElement('p', { 
                          key: 'reason', 
                          className: 'text-sm text-red-700' 
                        }, data.rejection_reason)
                      ])
                    ])
                  ]
                )
              ] : null
            ),
            
            // Footer with actions - Modern style
            React.createElement(
              'div',
              { key: 'footer', className: 'flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200' },
              React.createElement(
                'div',
                { key: 'actions', className: 'flex justify-end gap-3' },
                [
                  React.createElement(
                    'button',
                    {
                      key: 'close-btn',
                      type: 'button',
                      onClick: onClose,
                      className: 'px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200'
                    },
                    'Đóng'
                  ),
                  data && canRegister && React.createElement(
                    'button',
                    {
                      key: 'register-btn',
                      type: 'button',
                      onClick: handleRegister,
                      className: 'px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-700 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200'
                    },
                    [
                      React.createElement(UserPlus, { key: 'icon', className: 'h-4 w-4' }),
                      'Đăng ký tham gia'
                    ]
                  )
                ]
              )
            )
          ]
        )
      ]
    )
  );
}
