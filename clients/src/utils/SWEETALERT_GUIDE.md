# SweetAlert2 Integration Guide

This guide shows how to use SweetAlert2 for all user interactions in the EduLMS application.

## Installation

SweetAlert2 is already installed in the project:
```bash
npm install sweetalert2
```

## Available Functions

All SweetAlert2 functions are available in `src/utils/sweetAlert.ts`:

### Basic Alerts

#### Success Alert
```typescript
import { showSuccessAlert } from '../utils/sweetAlert';

showSuccessAlert('Success!', 'Operation completed successfully.');
```

#### Error Alert
```typescript
import { showErrorAlert } from '../utils/sweetAlert';

showErrorAlert('Error!', 'Something went wrong.');
```

#### Warning Alert
```typescript
import { showWarningAlert } from '../utils/sweetAlert';

showWarningAlert('Warning!', 'Please review your input.');
```

#### Info Alert
```typescript
import { showInfoAlert } from '../utils/sweetAlert';

showInfoAlert('Information', 'Here is some important information.');
```

### Confirmation Dialogs

#### Basic Confirmation
```typescript
import { showConfirmDialog } from '../utils/sweetAlert';

const result = await showConfirmDialog(
  'Confirm Action',
  'Are you sure you want to proceed?',
  'Yes, Continue',
  'Cancel'
);

if (result.isConfirmed) {
  // User clicked "Yes, Continue"
  // Perform action
}
```

#### Delete Confirmation
```typescript
import { showDeleteConfirmDialog } from '../utils/sweetAlert';

const result = await showDeleteConfirmDialog('this user');

if (result.isConfirmed) {
  // User confirmed deletion
  await deleteUser(userId);
  showSuccessAlert('Deleted!', 'User has been deleted successfully.');
}
```

### Form Validation

#### Form Error Alert
```typescript
import { showFormErrorAlert } from '../utils/sweetAlert';

const errors = {
  email: 'Email is required',
  password: 'Password must be at least 6 characters'
};

showFormErrorAlert(errors);
```

### API Error Handling

#### Handle API Errors
```typescript
import { handleApiError } from '../utils/sweetAlert';

try {
  await apiCall();
} catch (error) {
  handleApiError(error, 'Failed to fetch data');
}
```

### Loading States

#### Show Loading
```typescript
import { showLoadingAlert, closeAlert } from '../utils/sweetAlert';

// Show loading
const loadingAlert = showLoadingAlert('Processing...');

// Close loading
closeAlert();
```

## Usage Examples

### 1. Login Page
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    showSuccessAlert('Login Successful!', 'Welcome back to EduLMS');
    navigate('/dashboard');
  } catch (error) {
    showErrorAlert('Login Failed', error.message || 'Invalid credentials');
  }
};
```

### 2. Registration Page
```typescript
const handleRegister = async (formData: RegisterForm) => {
  // Validate form
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    showFormErrorAlert(errors);
    return;
  }

  try {
    await register(formData);
    showSuccessAlert(
      'Registration Successful!', 
      'Your account has been created successfully.'
    );
    navigate('/login');
  } catch (error) {
    handleApiError(error, 'Registration failed');
  }
};
```

### 3. CRUD Operations
```typescript
// Create
const handleCreate = async (data: any) => {
  try {
    await createItem(data);
    showSuccessAlert('Created!', 'Item has been created successfully.');
    fetchItems(); // Refresh list
  } catch (error) {
    handleApiError(error, 'Failed to create item');
  }
};

// Update
const handleUpdate = async (id: string, data: any) => {
  try {
    await updateItem(id, data);
    showSuccessAlert('Updated!', 'Item has been updated successfully.');
    fetchItems(); // Refresh list
  } catch (error) {
    handleApiError(error, 'Failed to update item');
  }
};

// Delete
const handleDelete = async (item: any) => {
  const result = await showDeleteConfirmDialog(item.name);
  
  if (result.isConfirmed) {
    try {
      await deleteItem(item.id);
      showSuccessAlert('Deleted!', `${item.name} has been deleted successfully.`);
      fetchItems(); // Refresh list
    } catch (error) {
      handleApiError(error, 'Failed to delete item');
    }
  }
};
```

### 4. File Upload
```typescript
const handleFileUpload = async (file: File) => {
  const loadingAlert = showLoadingAlert('Uploading file...');
  
  try {
    await uploadFile(file);
    closeAlert();
    showSuccessAlert('Upload Successful!', 'File has been uploaded successfully.');
  } catch (error) {
    closeAlert();
    handleApiError(error, 'Failed to upload file');
  }
};
```

### 5. Logout Confirmation
```typescript
const handleLogout = async () => {
  const result = await showConfirmDialog(
    'Logout',
    'Are you sure you want to logout?',
    'Yes, Logout',
    'Cancel'
  );

  if (result.isConfirmed) {
    logout();
    showSuccessAlert('Logged Out', 'You have been successfully logged out.');
    navigate('/');
  }
};
```

## Customization

### Custom Alert with HTML
```typescript
import { showCustomAlert } from '../utils/sweetAlert';

const htmlContent = `
  <div class="text-left">
    <h3 class="font-bold mb-2">Custom Content</h3>
    <p>This alert contains custom HTML content.</p>
    <ul class="list-disc list-inside mt-2">
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  </div>
`;

showCustomAlert('Custom Alert', htmlContent);
```

### Success with Actions
```typescript
import { showSuccessWithActions } from '../utils/sweetAlert';

showSuccessWithActions(
  'Operation Complete',
  'What would you like to do next?',
  [
    {
      text: 'View Details',
      action: () => navigate('/details')
    },
    {
      text: 'Create Another',
      action: () => handleCreate()
    }
  ]
);
```

## Best Practices

1. **Always handle errors**: Use `handleApiError` for consistent error handling
2. **Show loading states**: Use `showLoadingAlert` for long operations
3. **Confirm destructive actions**: Use `showDeleteConfirmDialog` for deletions
4. **Validate forms**: Use `showFormErrorAlert` for form validation errors
5. **Provide feedback**: Show success messages for user actions
6. **Be specific**: Include relevant details in error and success messages

## Migration from Old Alert System

### Before (using console.error and basic alerts)
```typescript
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  alert('Something went wrong');
}
```

### After (using SweetAlert2)
```typescript
try {
  await apiCall();
  showSuccessAlert('Success!', 'Operation completed successfully.');
} catch (error) {
  handleApiError(error, 'Operation failed');
}
```

## Configuration

The SweetAlert2 configuration is centralized in `src/utils/sweetAlert.ts`. You can modify colors, timers, and other settings there:

```typescript
// Example configuration
export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#2563eb', // Blue color matching our theme
    confirmButtonText: 'OK',
    timer: 3000, // Auto-close after 3 seconds
    timerProgressBar: true, // Show progress bar
  });
};
```

This ensures consistent styling and behavior across the entire application. 