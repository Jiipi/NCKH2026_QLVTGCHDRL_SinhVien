/**
 * ESLint Configuration - Frontend
 * Hiện lỗi rõ ràng, dễ fix
 */
module.exports = {
  extends: ['react-app', 'react-app/jest'],
  
  rules: {
    // ========== Tắt các warning không quan trọng ==========
    // Biến không sử dụng - chuyển thành warning thay vì error
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',      // Bỏ qua biến bắt đầu bằng _
      varsIgnorePattern: '^_',      // Ví dụ: _unused, _temp
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],

    // React hooks dependencies - giữ warning để biết nhưng không block
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility - tắt bớt vì không critical
    'jsx-a11y/anchor-is-valid': 'off',
    
    // Unicode BOM - tắt (không quan trọng)
    'unicode-bom': 'off',

    // ========== Giữ các lỗi quan trọng ==========
    // Lỗi logic thực sự
    'no-unreachable': 'error',
    'no-throw-literal': 'warn',
    
    // Import/Export
    'import/no-anonymous-default-export': 'warn',
  },

  // Bỏ qua một số file
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    '*.min.js',
    'playwright-report/',
  ],

  // Settings cho import resolver
  settings: {
    react: {
      version: 'detect'
    }
  }
};
