export function getStoredApprovalSemester() {
  return sessionStorage.getItem('current_semester') || '';
}
