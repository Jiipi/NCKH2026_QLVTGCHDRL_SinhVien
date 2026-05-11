export function invalidateSemesterCache() {
  try {
    sessionStorage.removeItem('semester_options');
    sessionStorage.removeItem('current_semester');
    localStorage.setItem('semester_options_invalidate', Date.now().toString());
    window.dispatchEvent(new Event('semester_options_bust'));
  } catch {
    // ignore storage/event failures
  }
}
