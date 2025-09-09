import Swal from 'sweetalert2';

// Success Alert Configuration
export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#2563eb', // Blue color matching our theme
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert Configuration
export const showErrorAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#dc2626', // Red color
    confirmButtonText: 'OK',
  });
};

// Warning Alert Configuration
export const showWarningAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#d97706', // Orange color
    confirmButtonText: 'OK',
  });
};

// Info Alert Configuration
export const showInfoAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#2563eb', // Blue color
    confirmButtonText: 'OK',
  });
};

// Confirmation Dialog
export const showConfirmDialog = (
  title: string,
  message: string,
  confirmText: string = 'Yes',
  cancelText: string = 'No'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

// Delete Confirmation Dialog
export const showDeleteConfirmDialog = (itemName: string = 'this item') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: `You want to delete ${itemName}. This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });
};

// Loading Alert
export const showLoadingAlert = (title: string = 'Loading...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open alert
export const closeAlert = () => {
  Swal.close();
};

// Custom Alert with HTML content
export const showCustomAlert = (title: string, htmlContent: string) => {
  return Swal.fire({
    title,
    html: htmlContent,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'OK',
  });
};

// Form Validation Error Alert
export const showFormErrorAlert = (errors: Record<string, string>) => {
  const errorMessages = Object.values(errors).filter(Boolean);
  const errorList = errorMessages.map(error => `<li>${error}</li>`).join('');
  
  return Swal.fire({
    icon: 'error',
    title: 'Please fix the following errors:',
    html: `<ul class="text-left list-disc list-inside">${errorList}</ul>`,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'OK',
  });
};

// Success with redirect
export const showSuccessAndRedirect = (
  title: string,
  message: string,
  redirectUrl: string,
  navigate: (url: string) => void
) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'OK',
    timer: 2000,
    timerProgressBar: true,
  }).then(() => {
    navigate(redirectUrl);
  });
};

// API Error Handler
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.errors) {
    // Handle field-specific errors
    const errors = error.response.data.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      errorMessage = errors.map((err: any) => err.message).join(', ');
    }
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return showErrorAlert('Error', errorMessage);
};

// Success with custom actions
export const showSuccessWithActions = (
  title: string,
  message: string,
  actions: { text: string; action: () => void }[]
) => {
  const buttons = actions.map((action, index) => 
    `<button class="swal2-confirm swal2-styled" style="margin: 0 5px;" onclick="window.sweetAlertAction${index}()">${action.text}</button>`
  ).join('');
  
  // Store actions globally temporarily
  actions.forEach((action, index) => {
    (window as any)[`sweetAlertAction${index}`] = action.action;
  });
  
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    html: `<div>${message}</div><div style="margin-top: 20px;">${buttons}</div>`,
    showConfirmButton: false,
    allowOutsideClick: true,
  }).then(() => {
    // Clean up global functions
    actions.forEach((_, index) => {
      delete (window as any)[`sweetAlertAction${index}`];
    });
  });
}; 