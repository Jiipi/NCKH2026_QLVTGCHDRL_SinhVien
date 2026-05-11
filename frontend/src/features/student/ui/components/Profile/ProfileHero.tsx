import React from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, Key } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
} as const;

export default function ProfileHero({
  profile,
  canDisplayImage,
  directImageUrl,
  onEdit,
  onChangePassword,
  editing,
  changingPassword
}) {
  return (
    <motion.div
      className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin tài khoản sinh viên</p>
          </div>
        </div>
        {!editing && !changingPassword && (
          <div className="flex gap-2 flex-wrap">
            <motion.button
              onClick={onChangePassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
            >
              <Key className="h-4 w-4" /> Đổi mật khẩu
            </motion.button>
            <motion.button
              onClick={onEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Edit3 className="h-4 w-4" /> Chỉnh sửa
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
