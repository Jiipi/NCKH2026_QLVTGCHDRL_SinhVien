const STUDENT_POINTS_SEMESTER_KEY = 'student_points_semester';

export function getStoredStudentPointsSemester() {
  try {
    return sessionStorage.getItem(STUDENT_POINTS_SEMESTER_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredStudentPointsSemester(semester: string) {
  if (!semester) return;
  try {
    sessionStorage.setItem(STUDENT_POINTS_SEMESTER_KEY, semester);
  } catch {
    // ignore storage failures
  }
}
