/**
 * Script để clear toàn bộ cache localStorage và sessionStorage
 * 
 * Cách sử dụng:
 * 1. Mở DevTools (F12)
 * 2. Vào tab Console
 * 3. Copy và paste script này vào console
 * 4. Nhấn Enter
 * 5. Reload trang (F5 hoặc Ctrl+R)
 * 
 * Hoặc chạy trực tiếp: clearAllCache()
 */

function clearAllCache() {
  console.log('🧹 Bắt đầu clear cache...');
  
  let cleared = {
    localStorage: 0,
    sessionStorage: 0,
    cookies: 0
  };
  
  try {
    // 1. Clear localStorage
    const localKeys = Object.keys(localStorage);
    console.log(`📦 Found ${localKeys.length} items in localStorage:`, localKeys);
    
    // Clear profile cache
    if (localStorage.getItem('profile')) {
      localStorage.removeItem('profile');
      cleared.localStorage++;
      console.log('✅ Cleared: localStorage.profile');
    }
    
    // Clear tab_id_temp
    if (localStorage.getItem('tab_id_temp')) {
      localStorage.removeItem('tab_id_temp');
      cleared.localStorage++;
      console.log('✅ Cleared: localStorage.tab_id_temp');
    }
    
    // Clear token (old auth)
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      cleared.localStorage++;
      console.log('✅ Cleared: localStorage.token');
    }
    
    // Clear user (old auth)
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user');
      cleared.localStorage++;
      console.log('✅ Cleared: localStorage.user');
    }
    
    // Clear all_tabs_registry
    if (localStorage.getItem('all_tabs_registry')) {
      localStorage.removeItem('all_tabs_registry');
      cleared.localStorage++;
      console.log('✅ Cleared: localStorage.all_tabs_registry');
    }
    
    console.log(`✅ Cleared ${cleared.localStorage} localStorage items`);
  } catch (e) {
    console.error('❌ Error clearing localStorage:', e);
  }
  
  try {
    // 2. Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    console.log(`📦 Found ${sessionKeys.length} items in sessionStorage:`, sessionKeys);
    
    sessionKeys.forEach(key => {
      if (key.startsWith('tab_session_data_') || key === 'tab_id') {
        sessionStorage.removeItem(key);
        cleared.sessionStorage++;
        console.log(`✅ Cleared: sessionStorage.${key}`);
      }
    });
    
    console.log(`✅ Cleared ${cleared.sessionStorage} sessionStorage items`);
  } catch (e) {
    console.error('❌ Error clearing sessionStorage:', e);
  }
  
  try {
    // 3. Clear cookies (nếu có)
    const cookies = document.cookie.split(';');
    console.log(`🍪 Found ${cookies.length} cookies`);
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('token') || name.includes('session') || name.includes('auth')) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        cleared.cookies++;
        console.log(`✅ Cleared cookie: ${name}`);
      }
    });
    
    console.log(`✅ Cleared ${cleared.cookies} cookies`);
  } catch (e) {
    console.error('❌ Error clearing cookies:', e);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN TẤT CLEAR CACHE!');
  console.log('='.repeat(60));
  console.log(`📊 Tổng kết:`);
  console.log(`   - localStorage: ${cleared.localStorage} items`);
  console.log(`   - sessionStorage: ${cleared.sessionStorage} items`);
  console.log(`   - cookies: ${cleared.cookies} items`);
  console.log('\n🔄 Hãy reload trang (F5 hoặc Ctrl+R) để áp dụng thay đổi!');
  console.log('='.repeat(60) + '\n');
  
  return {
    success: true,
    cleared: cleared,
    message: 'Cache cleared successfully! Please reload the page.'
  };
}

// Auto-run nếu file được load trực tiếp
if (typeof window !== 'undefined') {
  window.clearAllCache = clearAllCache;
  console.log('✅ Loaded clearAllCache() function. Run clearAllCache() to clear all cache.');
}
