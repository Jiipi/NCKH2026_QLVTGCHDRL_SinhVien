# Frontend Clean Architecture - Cấu Trúc Chi Tiết
## Tuân Thủ SOLID Principles & Clean Code (Plain JavaScript)

> **Dự án:** Hệ thống Quản lý Hoạt động Rèn Luyện  
> **Framework:** React (Plain JavaScript - No JSX)  
> **Kiến trúc:** Feature-Sliced Design + Clean Architecture  
> **Mục tiêu:** Component isolation, Reusability, Testability, SOLID compliance

---

## 📐 Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────┐
│   Presentation Layer (React Components) │ ← UI/UX
├─────────────────────────────────────────┤
│   Application Layer (Hooks & State)     │ ← State Management
├─────────────────────────────────────────┤
│   Domain Layer (Models & Business Logic)│ ← Client-side Rules
├─────────────────────────────────────────┤
│   Infrastructure Layer (API & Storage)  │ ← API Clients, LocalStorage
└─────────────────────────────────────────┘
```

### Dependency Flow (Frontend)
```
Components → Hooks → Services → API Client
     ↓         ↓         ↓           ↑
   Views    State    Models      Adapters
```

---

## 🗂️ Cấu Trúc Thư Mục Đề Xuất (Feature-Sliced Design)

```
frontend/
├── src/
│   ├── app/                             # APPLICATION SETUP
│   │   ├── App.js                       # Root Component
│   │   ├── AppProviders.js              # Global Providers
│   │   ├── AppRouter.js                 # Route Configuration
│   │   └── config/
│   │       ├── api.config.js
│   │       ├── auth.config.js
│   │       └── theme.config.js
│   │
│   ├── features/                        # FEATURES (Business Logic)
│   │   ├── auth/                        # Authentication Feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.js
│   │   │   │   ├── RegisterForm.js
│   │   │   │   └── PasswordResetForm.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.js           # Auth state management
│   │   │   │   ├── useLogin.js          # Login logic
│   │   │   │   └── useRegister.js       # Register logic
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── authService.js       # API calls
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── User.model.js        # User entity
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   └── authValidators.js    # Validation rules
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── LoginPage.js
│   │   │       └── RegisterPage.js
│   │   │
│   │   ├── activities/                  # Activities Feature
│   │   │   ├── components/
│   │   │   │   ├── ActivityCard.js
│   │   │   │   ├── ActivityList.js
│   │   │   │   ├── ActivityFilters.js
│   │   │   │   ├── ActivityForm.js
│   │   │   │   └── ActivityDetails.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useActivities.js
│   │   │   │   ├── useActivityFilters.js
│   │   │   │   ├── useCreateActivity.js
│   │   │   │   └── useActivityDetails.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── activityService.js
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── Activity.model.js
│   │   │   │   └── ActivityStatus.enum.js
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   └── activityValidators.js
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── ActivitiesListPage.js
│   │   │       ├── ActivityCreatePage.js
│   │   │       └── ActivityDetailPage.js
│   │   │
│   │   ├── registrations/               # Registration Feature
│   │   │   ├── components/
│   │   │   │   ├── RegistrationCard.js
│   │   │   │   ├── RegistrationList.js
│   │   │   │   └── RegistrationStatus.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useRegistrations.js
│   │   │   │   ├── useRegisterActivity.js
│   │   │   │   └── useCancelRegistration.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── registrationService.js
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── Registration.model.js
│   │   │   │
│   │   │   └── pages/
│   │   │       └── MyRegistrationsPage.js
│   │   │
│   │   ├── profile/                     # Profile Feature
│   │   │   ├── components/
│   │   │   │   ├── ProfileCard.js
│   │   │   │   ├── ProfileEditForm.js
│   │   │   │   └── ChangePasswordForm.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useProfile.js
│   │   │   │   └── useUpdateProfile.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── profileService.js
│   │   │   │
│   │   │   └── pages/
│   │   │       └── ProfilePage.js
│   │   │
│   │   ├── permissions/                 # Permissions Feature
│   │   │   ├── components/
│   │   │   │   ├── PermissionGuard.js
│   │   │   │   └── RolePermissionTable.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── usePermissions.js
│   │   │   │   └── useCheckPermission.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── permissionService.js
│   │   │   │
│   │   │   └── constants/
│   │   │       └── permissions.js
│   │   │
│   │   ├── semesters/                   # Semesters Feature
│   │   │   ├── components/
│   │   │   │   ├── SemesterDropdown.js
│   │   │   │   ├── SemesterCard.js
│   │   │   │   └── SemesterForm.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useSemesters.js
│   │   │   │   ├── useCurrentSemester.js
│   │   │   │   └── useSemesterFilters.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── semesterService.js
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── Semester.model.js
│   │   │   │
│   │   │   └── pages/
│   │   │       └── SemestersPage.js
│   │   │
│   │   └── notifications/               # Notifications Feature
│   │       ├── components/
│   │       │   ├── NotificationBell.js
│   │       │   ├── NotificationList.js
│   │       │   └── NotificationItem.js
│   │       │
│   │       ├── hooks/
│   │       │   ├── useNotifications.js
│   │       │   └── useMarkAsRead.js
│   │       │
│   │       ├── services/
│   │       │   └── notificationService.js
│   │       │
│   │       └── models/
│   │           └── Notification.model.js
│   │
│   ├── shared/                          # SHARED UTILITIES
│   │   ├── components/                  # Reusable Components
│   │   │   ├── ui/                      # UI Primitives
│   │   │   │   ├── Button.js
│   │   │   │   ├── Input.js
│   │   │   │   ├── Select.js
│   │   │   │   ├── Checkbox.js
│   │   │   │   ├── Radio.js
│   │   │   │   ├── Modal.js
│   │   │   │   ├── Card.js
│   │   │   │   ├── Table.js
│   │   │   │   ├── Spinner.js
│   │   │   │   └── Alert.js
│   │   │   │
│   │   │   ├── layout/                  # Layout Components
│   │   │   │   ├── Header.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Container.js
│   │   │   │   └── PageLayout.js
│   │   │   │
│   │   │   ├── forms/                   # Form Components
│   │   │   │   ├── FormField.js
│   │   │   │   ├── FormError.js
│   │   │   │   ├── FormGroup.js
│   │   │   │   └── FormActions.js
│   │   │   │
│   │   │   └── feedback/                # Feedback Components
│   │   │       ├── ErrorBoundary.js
│   │   │       ├── LoadingSpinner.js
│   │   │       ├── EmptyState.js
│   │   │       └── Toast.js
│   │   │
│   │   ├── hooks/                       # Shared Hooks
│   │   │   ├── useAsync.js              # Async state management
│   │   │   ├── useDebounce.js           # Debounce values
│   │   │   ├── useLocalStorage.js       # LocalStorage hook
│   │   │   ├── useModal.js              # Modal control
│   │   │   ├── usePagination.js         # Pagination logic
│   │   │   ├── useForm.js               # Form state
│   │   │   └── useToast.js              # Toast notifications
│   │   │
│   │   ├── utils/                       # Utility Functions
│   │   │   ├── validators.js            # Common validators
│   │   │   ├── formatters.js            # Date, number formatters
│   │   │   ├── helpers.js               # Helper functions
│   │   │   ├── storage.js               # Storage utilities
│   │   │   └── dom.js                   # DOM utilities
│   │   │
│   │   ├── constants/                   # Shared Constants
│   │   │   ├── routes.js                # Route paths
│   │   │   ├── apiEndpoints.js          # API endpoints
│   │   │   ├── roles.js                 # User roles
│   │   │   ├── statuses.js              # Status constants
│   │   │   └── errorMessages.js         # Error messages
│   │   │
│   │   └── types/                       # Type Definitions (JSDoc)
│   │       ├── user.types.js
│   │       ├── activity.types.js
│   │       └── common.types.js
│   │
│   ├── infrastructure/                  # INFRASTRUCTURE LAYER
│   │   ├── api/                         # API Communication
│   │   │   ├── client/
│   │   │   │   ├── axiosClient.js       # Axios instance
│   │   │   │   └── interceptors/
│   │   │   │       ├── authInterceptor.js
│   │   │   │       ├── errorInterceptor.js
│   │   │   │       └── permissionInterceptor.js
│   │   │   │
│   │   │   ├── adapters/                # Response adapters
│   │   │   │   ├── userAdapter.js
│   │   │   │   ├── activityAdapter.js
│   │   │   │   └── baseAdapter.js
│   │   │   │
│   │   │   └── contracts/               # API Contracts
│   │   │       ├── IApiClient.js
│   │   │       └── IAdapter.js
│   │   │
│   │   ├── storage/                     # Storage Layer
│   │   │   ├── LocalStorageService.js
│   │   │   ├── SessionStorageService.js
│   │   │   └── CacheService.js
│   │   │
│   │   └── logger/                      # Logging
│   │       └── ConsoleLogger.js
│   │
│   ├── store/                           # STATE MANAGEMENT (Optional)
│   │   ├── index.js                     # Store setup
│   │   ├── slices/                      # Redux slices (if using Redux)
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   └── permissionsSlice.js
│   │   │
│   │   └── context/                     # React Context (alternative)
│   │       ├── AuthContext.js
│   │       ├── PermissionsContext.js
│   │       └── ThemeContext.js
│   │
│   ├── assets/                          # STATIC ASSETS
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css
│   │       ├── variables.css
│   │       └── utilities.css
│   │
│   └── index.js                         # Entry Point
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── tests/                               # TESTS
│   ├── unit/                            # Unit Tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── integration/                     # Integration Tests
│   │   └── features/
│   │
│   └── e2e/                             # E2E Tests (Playwright)
│       └── scenarios/
│
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── playwright.config.js
└── README.md
```

---

## 🎯 SOLID Principles Implementation (React Context)

### 1. Single Responsibility Principle (SRP)

**✅ Mỗi component/hook chỉ có 1 trách nhiệm**

#### ❌ Vi phạm SRP:
```javascript
// BAD: Component làm quá nhiều việc
function UserProfilePage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  
  // Fetch user
  React.useEffect(() => {
    setLoading(true);
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);
  
  // Form handling
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Submit
  const handleSubmit = async () => {
    if (!formData.name || formData.name.length < 3) {
      alert('Name too short');
      return;
    }
    
    try {
      await fetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Updated!');
      setIsEditing(false);
    } catch (err) {
      alert('Error!');
    }
  };
  
  // Rendering logic
  if (loading) return React.createElement('div', null, 'Loading...');
  if (error) return React.createElement('div', null, 'Error!');
  
  return React.createElement('div', null,
    isEditing 
      ? React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('input', { 
            name: 'name', 
            value: formData.name, 
            onChange: handleInputChange 
          })
        )
      : React.createElement('div', null, user?.name)
  );
}
```

#### ✅ Tuân thủ SRP:
```javascript
// GOOD: Tách thành nhiều modules với trách nhiệm rõ ràng

// 1. Hook - Fetch user data ONLY
function useUser() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    profileService.getMyProfile()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading, error };
}

// 2. Hook - Update user ONLY
function useUpdateProfile() {
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const updateProfile = async (data) => {
    setUpdating(true);
    setError(null);
    
    try {
      await profileService.updateProfile(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };
  
  return { updateProfile, updating, error };
}

// 3. Hook - Form state management ONLY
function useProfileForm(initialValues) {
  const [formData, setFormData] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const reset = () => {
    setFormData(initialValues);
    setErrors({});
  };
  
  return { formData, errors, handleChange, validate, reset };
}

// 4. Component - Display user data ONLY
function ProfileDisplay({ user }) {
  return React.createElement('div', { className: 'profile-display' },
    React.createElement('h2', null, user.name),
    React.createElement('p', null, user.email),
    React.createElement('p', null, `Joined: ${new Date(user.createdAt).toLocaleDateString()}`)
  );
}

// 5. Component - Edit form ONLY
function ProfileEditForm({ initialValues, onSubmit, onCancel }) {
  const { formData, errors, handleChange, validate } = useProfileForm(initialValues);
  const { updateProfile, updating } = useUpdateProfile();
  const toast = useToast();
  
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success('Profile updated successfully');
      onSubmit();
    } else {
      toast.error(result.error);
    }
  };
  
  return React.createElement('form', { onSubmit: handleSubmitForm },
    React.createElement(FormField, {
      label: 'Name',
      name: 'name',
      value: formData.name,
      error: errors.name,
      onChange: (e) => handleChange('name', e.target.value)
    }),
    React.createElement('div', { className: 'form-actions' },
      React.createElement(Button, { 
        type: 'submit', 
        disabled: updating 
      }, 'Save'),
      React.createElement(Button, { 
        type: 'button', 
        onClick: onCancel 
      }, 'Cancel')
    )
  );
}

// 6. Page - Orchestrate components ONLY
function ProfilePage() {
  const { user, loading, error } = useUser();
  const [isEditing, setIsEditing] = React.useState(false);
  
  if (loading) {
    return React.createElement(LoadingSpinner);
  }
  
  if (error) {
    return React.createElement(ErrorMessage, { message: error });
  }
  
  return React.createElement(PageLayout, null,
    React.createElement('div', { className: 'profile-page' },
      isEditing
        ? React.createElement(ProfileEditForm, {
            initialValues: user,
            onSubmit: () => setIsEditing(false),
            onCancel: () => setIsEditing(false)
          })
        : React.createElement(React.Fragment, null,
            React.createElement(ProfileDisplay, { user }),
            React.createElement(Button, { 
              onClick: () => setIsEditing(true) 
            }, 'Edit Profile')
          )
    )
  );
}
```

---

### 2. Open/Closed Principle (OCP)

**✅ Mở để mở rộng, đóng để sửa đổi**

#### ❌ Vi phạm OCP:
```javascript
// BAD: Phải sửa component mỗi khi thêm field type mới
function FormField({ type, name, value, onChange }) {
  if (type === 'text') {
    return React.createElement('input', {
      type: 'text',
      name,
      value,
      onChange
    });
  } else if (type === 'email') {
    return React.createElement('input', {
      type: 'email',
      name,
      value,
      onChange
    });
  } else if (type === 'date') {
    // PHẢI SỬA CODE để thêm date picker
    return React.createElement('input', {
      type: 'date',
      name,
      value,
      onChange
    });
  }
}
```

#### ✅ Tuân thủ OCP:
```javascript
// GOOD: Component composition pattern

// Base Field Component
function BaseField({ label, name, error, children }) {
  return React.createElement('div', { className: 'form-field' },
    label && React.createElement('label', { htmlFor: name }, label),
    children,
    error && React.createElement('span', { className: 'error' }, error)
  );
}

// Text Input
function TextInput({ name, value, onChange, placeholder, ...props }) {
  return React.createElement('input', {
    type: 'text',
    name,
    value,
    onChange,
    placeholder,
    ...props
  });
}

// Email Input
function EmailInput({ name, value, onChange, placeholder, ...props }) {
  return React.createElement('input', {
    type: 'email',
    name,
    value,
    onChange,
    placeholder,
    ...props
  });
}

// Date Picker - THÊM MỚI không sửa code cũ
function DatePicker({ name, value, onChange, minDate, maxDate }) {
  return React.createElement('input', {
    type: 'date',
    name,
    value,
    onChange,
    min: minDate,
    max: maxDate
  });
}

// Select Dropdown
function Select({ name, value, onChange, options }) {
  return React.createElement('select', { name, value, onChange },
    options.map(opt =>
      React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
    )
  );
}

// Usage - Compose fields
function ProfileForm() {
  return React.createElement('form', null,
    React.createElement(BaseField, { label: 'Name', name: 'name' },
      React.createElement(TextInput, { name: 'name', value: '', onChange: () => {} })
    ),
    React.createElement(BaseField, { label: 'Email', name: 'email' },
      React.createElement(EmailInput, { name: 'email', value: '', onChange: () => {} })
    ),
    React.createElement(BaseField, { label: 'Birthday', name: 'birthday' },
      React.createElement(DatePicker, { name: 'birthday', value: '', onChange: () => {} })
    ),
    React.createElement(BaseField, { label: 'Role', name: 'role' },
      React.createElement(Select, { 
        name: 'role', 
        value: '', 
        onChange: () => {},
        options: [{ value: 'admin', label: 'Admin' }]
      })
    )
  );
}
```

---

### 3. Liskov Substitution Principle (LSP)

**✅ Derived components có thể thay thế base components**

#### ✅ Tuân thủ LSP:
```javascript
// Base Button Component
function Button({ children, onClick, disabled, type = 'button', ...props }) {
  return React.createElement('button', {
    type,
    onClick,
    disabled,
    className: 'btn',
    ...props
  }, children);
}

// Primary Button - có thể thay thế Button
function PrimaryButton({ children, ...props }) {
  return React.createElement(Button, {
    ...props,
    className: 'btn btn-primary'
  }, children);
}

// Secondary Button - có thể thay thế Button
function SecondaryButton({ children, ...props }) {
  return React.createElement(Button, {
    ...props,
    className: 'btn btn-secondary'
  }, children);
}

// Danger Button - có thể thay thế Button
function DangerButton({ children, ...props }) {
  return React.createElement(Button, {
    ...props,
    className: 'btn btn-danger'
  }, children);
}

// Loading Button - có thể thay thế Button
function LoadingButton({ children, loading, ...props }) {
  return React.createElement(Button, {
    ...props,
    disabled: loading || props.disabled
  }, 
    loading 
      ? React.createElement('span', null, 'Loading...')
      : children
  );
}

// Usage - có thể swap bất kỳ button variant nào
function ActionButtons() {
  const handleClick = () => console.log('clicked');
  
  return React.createElement('div', null,
    React.createElement(Button, { onClick: handleClick }, 'Default'),
    React.createElement(PrimaryButton, { onClick: handleClick }, 'Primary'),
    React.createElement(SecondaryButton, { onClick: handleClick }, 'Secondary'),
    React.createElement(DangerButton, { onClick: handleClick }, 'Delete'),
    React.createElement(LoadingButton, { 
      onClick: handleClick, 
      loading: true 
    }, 'Submit')
  );
}
```

---

### 4. Interface Segregation Principle (ISP)

**✅ Nhiều hooks nhỏ, focused thay vì 1 hook lớn**

#### ❌ Vi phạm ISP:
```javascript
// BAD: Hook quá lớn, bắt dùng tất cả features
function useUser() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  
  const fetchUser = async () => { /* ... */ };
  const updateUser = async (data) => { /* ... */ };
  const deleteUser = async () => { /* ... */ };
  const uploadAvatar = async (file) => { /* ... */ };
  const changePassword = async (oldPass, newPass) => { /* ... */ };
  
  // Component chỉ cần fetch nhưng phải load tất cả methods
  return { 
    user, loading, updating, deleting,
    fetchUser, updateUser, deleteUser, uploadAvatar, changePassword
  };
}
```

#### ✅ Tuân thủ ISP:
```javascript
// GOOD: Nhiều hooks nhỏ, specialized

// Hook 1: Fetch user ONLY
function useUserQuery(userId) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    userService.getById(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

// Hook 2: Update user ONLY
function useUpdateUser() {
  const [updating, setUpdating] = React.useState(false);
  
  const updateUser = async (userId, data) => {
    setUpdating(true);
    try {
      await userService.update(userId, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };
  
  return { updateUser, updating };
}

// Hook 3: Delete user ONLY
function useDeleteUser() {
  const [deleting, setDeleting] = React.useState(false);
  
  const deleteUser = async (userId) => {
    setDeleting(true);
    try {
      await userService.delete(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setDeleting(false);
    }
  };
  
  return { deleteUser, deleting };
}

// Hook 4: Upload avatar ONLY
function useUploadAvatar() {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  
  const uploadAvatar = async (file) => {
    setUploading(true);
    setProgress(0);
    
    try {
      await userService.uploadAvatar(file, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setUploading(false);
    }
  };
  
  return { uploadAvatar, uploading, progress };
}

// Usage - chỉ dùng hooks cần thiết
function UserProfileDisplay() {
  const { user, loading } = useUserQuery('123'); // Chỉ fetch
  
  if (loading) return React.createElement(LoadingSpinner);
  
  return React.createElement('div', null, user.name);
}

function UserEditForm() {
  const { user } = useUserQuery('123');
  const { updateUser, updating } = useUpdateUser(); // Thêm update
  
  return React.createElement('form', null, /* ... */);
}

function UserAvatarUpload() {
  const { uploadAvatar, uploading, progress } = useUploadAvatar(); // Chỉ upload
  
  return React.createElement('div', null, /* ... */);
}
```

---

### 5. Dependency Inversion Principle (DIP)

**✅ Components phụ thuộc abstractions (interfaces), không phụ thuộc implementations**

#### ❌ Vi phạm DIP:
```javascript
// BAD: Component phụ thuộc trực tiếp axios
function UserList() {
  const [users, setUsers] = React.useState([]);
  
  React.useEffect(() => {
    // Hard-coded axios call
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);
  
  return React.createElement('ul', null,
    users.map(user => React.createElement('li', { key: user.id }, user.name))
  );
}
```

#### ✅ Tuân thủ DIP:
```javascript
// GOOD: Component phụ thuộc abstraction (service interface)

// Abstraction - API Client Interface
class IApiClient {
  async get(url) { throw new Error('Must implement'); }
  async post(url, data) { throw new Error('Must implement'); }
  async put(url, data) { throw new Error('Must implement'); }
  async delete(url) { throw new Error('Must implement'); }
}

// Implementation 1 - Axios Client
class AxiosApiClient extends IApiClient {
  constructor() {
    super();
    this.client = axios.create({ baseURL: '/api' });
  }
  
  async get(url) {
    const response = await this.client.get(url);
    return response.data;
  }
  
  async post(url, data) {
    const response = await this.client.post(url, data);
    return response.data;
  }
}

// Implementation 2 - Fetch Client (có thể swap)
class FetchApiClient extends IApiClient {
  async get(url) {
    const response = await fetch(`/api${url}`);
    return response.json();
  }
  
  async post(url, data) {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Service - phụ thuộc IApiClient interface
class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient; // IApiClient
  }
  
  async getAll() {
    return this.apiClient.get('/users');
  }
  
  async getById(id) {
    return this.apiClient.get(`/users/${id}`);
  }
  
  async create(data) {
    return this.apiClient.post('/users', data);
  }
}

// Dependency Injection via Context
const ApiClientContext = React.createContext(null);

function ApiClientProvider({ children, client }) {
  return React.createElement(ApiClientContext.Provider, 
    { value: client },
    children
  );
}

function useApiClient() {
  const client = React.useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within ApiClientProvider');
  }
  return client;
}

// Custom hook - inject service with apiClient
function useUserService() {
  const apiClient = useApiClient();
  return React.useMemo(() => new UserService(apiClient), [apiClient]);
}

// Component - phụ thuộc service abstraction
function UserList() {
  const userService = useUserService(); // Injected dependency
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    userService.getAll()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userService]);
  
  if (loading) return React.createElement(LoadingSpinner);
  
  return React.createElement('ul', null,
    users.map(user => React.createElement('li', { key: user.id }, user.name))
  );
}

// App Setup - inject implementation
function App() {
  const apiClient = new AxiosApiClient(); // Có thể swap với FetchApiClient
  
  return React.createElement(ApiClientProvider, { client: apiClient },
    React.createElement(UserList)
  );
}

// Testing - dễ dàng mock
class MockApiClient extends IApiClient {
  async get(url) {
    return [{ id: 1, name: 'Test User' }];
  }
}

// In test
const mockClient = new MockApiClient();
render(
  React.createElement(ApiClientProvider, { client: mockClient },
    React.createElement(UserList)
  )
);
```

---

## 📝 Clean Code Patterns (Plain JavaScript)

### 1. Custom Hooks Pattern

```javascript
// ✅ Reusable async state management
function useAsync(asyncFunction) {
  const [status, setStatus] = React.useState('idle'); // 'idle' | 'pending' | 'success' | 'error'
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  const execute = React.useCallback(async (...params) => {
    setStatus('pending');
    setData(null);
    setError(null);
    
    try {
      const result = await asyncFunction(...params);
      setData(result);
      setStatus('success');
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      setStatus('error');
      return { success: false, error: err };
    }
  }, [asyncFunction]);
  
  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

// Usage
function UserProfile() {
  const fetchUser = React.useCallback(() => userService.getById('123'), []);
  const { execute, data: user, isPending, isError } = useAsync(fetchUser);
  
  React.useEffect(() => {
    execute();
  }, [execute]);
  
  if (isPending) return React.createElement(LoadingSpinner);
  if (isError) return React.createElement(ErrorMessage);
  
  return React.createElement('div', null, user?.name);
}
```

### 2. Compound Component Pattern

```javascript
// ✅ Flexible, composable components
const TabsContext = React.createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  
  const value = React.useMemo(() => ({
    activeTab,
    setActiveTab
  }), [activeTab]);
  
  return React.createElement(TabsContext.Provider, { value },
    React.createElement('div', { className: 'tabs' }, children)
  );
}

function TabList({ children }) {
  return React.createElement('div', { className: 'tab-list', role: 'tablist' },
    children
  );
}

function Tab({ id, children }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === id;
  
  return React.createElement('button', {
    role: 'tab',
    'aria-selected': isActive,
    className: isActive ? 'tab active' : 'tab',
    onClick: () => setActiveTab(id)
  }, children);
}

function TabPanels({ children }) {
  return React.createElement('div', { className: 'tab-panels' }, children);
}

function TabPanel({ id, children }) {
  const { activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== id) return null;
  
  return React.createElement('div', { 
    role: 'tabpanel',
    className: 'tab-panel'
  }, children);
}

// Export as compound component
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// Usage - very flexible
function ActivityDetailsPage() {
  return React.createElement(Tabs, { defaultTab: 'info' },
    React.createElement(Tabs.List, null,
      React.createElement(Tabs.Tab, { id: 'info' }, 'Information'),
      React.createElement(Tabs.Tab, { id: 'registrations' }, 'Registrations'),
      React.createElement(Tabs.Tab, { id: 'points' }, 'Points')
    ),
    React.createElement(Tabs.Panels, null,
      React.createElement(Tabs.Panel, { id: 'info' },
        React.createElement(ActivityInfo)
      ),
      React.createElement(Tabs.Panel, { id: 'registrations' },
        React.createElement(RegistrationList)
      ),
      React.createElement(Tabs.Panel, { id: 'points' },
        React.createElement(PointsTable)
      )
    )
  );
}
```

### 3. Render Props Pattern

```javascript
// ✅ Share logic without HOC
function DataFetcher({ url, children }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return children({ data, loading, error });
}

// Usage
function UserProfile() {
  return React.createElement(DataFetcher, { url: '/api/users/me' },
    ({ data: user, loading, error }) => {
      if (loading) return React.createElement(LoadingSpinner);
      if (error) return React.createElement(ErrorMessage, { error });
      return React.createElement('div', null, user.name);
    }
  );
}
```

### 4. Error Boundary Pattern

```javascript
// ✅ Catch errors in component tree
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', null,
        React.createElement('h1', null, 'Something went wrong'),
        React.createElement('pre', null, this.state.error?.message)
      );
    }
    
    return this.props.children;
  }
}

// Usage
function App() {
  return React.createElement(ErrorBoundary, {
    fallback: React.createElement('div', null, 'App crashed!')
  },
    React.createElement(UserDashboard)
  );
}
```

---

## 🔧 Service Layer Pattern

```javascript
// infrastructure/api/client/axiosClient.js
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } else if (error.response?.status === 403) {
      // Handle forbidden
      window.dispatchEvent(new CustomEvent('permission:denied'));
    }
    return Promise.reject(error);
  }
);

module.exports = { axiosClient };

// features/activities/services/activityService.js
const { axiosClient } = require('../../../infrastructure/api/client/axiosClient');

class ActivityService {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await axiosClient.get(`/activities?${params}`);
    return response.data;
  }
  
  async getById(id) {
    const response = await axiosClient.get(`/activities/${id}`);
    return response.data;
  }
  
  async create(data) {
    const response = await axiosClient.post('/activities', data);
    return response.data;
  }
  
  async update(id, data) {
    const response = await axiosClient.put(`/activities/${id}`, data);
    return response.data;
  }
  
  async delete(id) {
    await axiosClient.delete(`/activities/${id}`);
  }
  
  async approve(id) {
    const response = await axiosClient.post(`/activities/${id}/approve`);
    return response.data;
  }
  
  async reject(id, reason) {
    const response = await axiosClient.post(`/activities/${id}/reject`, { reason });
    return response.data;
  }
}

module.exports = { activityService: new ActivityService() };
```

---

## ✅ Testing Strategy

### Unit Tests (Jest + React Testing Library)

```javascript
// tests/unit/hooks/usePermissions.test.js
const { renderHook, act } = require('@testing-library/react-hooks');
const { usePermissions } = require('../../../src/features/permissions/hooks/usePermissions');

describe('usePermissions', () => {
  it('should fetch permissions on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.permissions).toHaveLength(5);
  });
  
  it('should check permission correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    expect(result.current.hasPermission('activities.read')).toBe(true);
    expect(result.current.hasPermission('users.delete')).toBe(false);
  });
});
```

### Integration Tests

```javascript
// tests/integration/features/activities.test.js
const { render, screen, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event');

describe('Activities Feature', () => {
  it('should display activities list', async () => {
    render(React.createElement(ActivitiesListPage));
    
    await waitFor(() => {
      expect(screen.getByText('Hoạt động 1')).toBeInTheDocument();
    });
  });
  
  it('should filter activities by status', async () => {
    render(React.createElement(ActivitiesListPage));
    
    const filterSelect = screen.getByLabelText('Status');
    await userEvent.selectOptions(filterSelect, 'approved');
    
    await waitFor(() => {
      expect(screen.queryByText('Pending Activity')).not.toBeInTheDocument();
    });
  });
});
```

---

## 📚 Best Practices Summary

### ✅ DO
- ✅ Sử dụng plain JavaScript với `React.createElement`
- ✅ Chia nhỏ components, mỗi component một việc
- ✅ Sử dụng custom hooks để tái sử dụng logic
- ✅ Dependency injection via Context/Props
- ✅ Service layer cho API calls
- ✅ PropTypes hoặc JSDoc cho type safety
- ✅ Error boundaries cho error handling
- ✅ Memoization cho performance (useMemo, useCallback)
- ✅ Code splitting với React.lazy
- ✅ Accessible components (ARIA attributes)

### ❌ DON'T
- ❌ Không dùng JSX (theo yêu cầu project)
- ❌ Không để business logic trong components
- ❌ Không fetch API trực tiếp trong components
- ❌ Không dùng inline styles (dùng CSS classes)
- ❌ Không mutate state trực tiếp
- ❌ Không skip useEffect dependencies
- ❌ Không dùng index làm key trong lists
- ❌ Không hardcode strings (dùng constants)
- ❌ Không catch errors và im lặng
- ❌ Không quên accessibility

---

**Next Steps:**
1. Refactor theo Feature-Sliced Design
2. Extract business logic thành custom hooks
3. Implement service layer
4. Setup testing framework
5. Optimize performance với React.memo, useMemo
6. Add comprehensive JSDoc comments

---

**Files đi kèm:**
- `BACKEND_CLEAN_ARCHITECTURE.md` - Backend architecture
- `DYNAMIC_PERMISSIONS_GUIDE.md` - Permission system guide
