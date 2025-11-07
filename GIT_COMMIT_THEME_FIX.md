# Git Commit Message

```bash
git add frontend/src/components/ModernHeader.js
git add FIX_THEME_SYNC_ISSUE.md
git add THEME_FIX_SUMMARY.md
git add frontend/test-theme-sync.html

git commit -m "fix(theme): Separate theme state per tab using sessionStorage

BREAKING CHANGE: Theme no longer syncs across browser tabs

- Changed from localStorage to sessionStorage for theme persistence
- Each browser tab now maintains its own independent theme preference
- Prevents unwanted theme synchronization when user works in multiple tabs
- Theme persists within same tab across refreshes but resets for new tabs

Technical details:
- Modified: frontend/src/components/ModernHeader.js
  - Line 34: localStorage.getItem('theme') → sessionStorage.getItem('theme')
  - Line 74: localStorage.setItem('theme') → sessionStorage.setItem('theme')
- Added: FIX_THEME_SYNC_ISSUE.md (comprehensive fix documentation)
- Added: THEME_FIX_SUMMARY.md (quick reference)
- Added: frontend/test-theme-sync.html (interactive demo)

Fixes issue where:
- User opens Tab A → switches to dark mode
- User opens Tab B → Tab B automatically becomes dark (unwanted)

New behavior:
- User opens Tab A → switches to dark mode (Tab A: dark)
- User opens Tab B → Tab B stays light mode (Tab B: light)
- Each tab independent, no cross-tab synchronization

Test:
1. Open http://localhost:3000 in Tab A
2. Toggle to dark mode in Tab A
3. Duplicate tab to create Tab B
4. Verify Tab B remains in light mode ✅
5. Verify Tab A still in dark mode ✅

Related:
- Closes: #[issue-number] (if applicable)
- See: FIX_THEME_SYNC_ISSUE.md for detailed explanation
- Demo: frontend/test-theme-sync.html"
```

---

## Hoặc ngắn gọn hơn:

```bash
git add frontend/src/components/ModernHeader.js FIX_THEME_SYNC_ISSUE.md THEME_FIX_SUMMARY.md frontend/test-theme-sync.html

git commit -m "fix(theme): Separate theme per tab using sessionStorage

- Changed localStorage → sessionStorage for theme
- Each tab now has independent theme state
- Prevents unwanted sync across browser tabs
- Added docs: FIX_THEME_SYNC_ISSUE.md
- Added demo: frontend/test-theme-sync.html"
```

---

## Push to remote:

```bash
git push origin main
```

---

## Cherry-pick cho hotfix (nếu cần):

```bash
# Nếu cần áp dụng fix này vào nhánh hotfix
git checkout hotfix/theme-sync
git cherry-pick <commit-hash>
git push origin hotfix/theme-sync
```
