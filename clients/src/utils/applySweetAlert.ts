import Swal from 'sweetalert2';

/**
 * SweetAlert2 utility functions for React components
 */

export const applySweetAlert = (options: any) => {
  return Swal.fire(options);
};

export const showSuccessAlert = (title: string, text: string, confirmButtonText: string = 'Great!') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText,
    confirmButtonColor: '#10b981'
  });
};

export const showErrorAlert = (title: string, text: string, confirmButtonText: string = 'Try Again') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText,
    confirmButtonColor: '#ef4444'
  });
};

export const showWarningAlert = (title: string, text: string, confirmButtonText: string = 'OK') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText,
    confirmButtonColor: '#f59e0b'
  });
};

export const showInfoAlert = (title: string, text: string, confirmButtonText: string = 'Got it!') => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText,
    confirmButtonColor: '#3b82f6'
  });
};

export const showDeleteConfirmDialog = (title: string, text: string, confirmButtonText: string = 'Delete', cancelButtonText: string = 'Cancel') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText
  });
};

export const showFormErrorAlert = (errors: Record<string, string>) => {
  const errorList = Object.values(errors).filter(error => error).join('<br>');
  
  return Swal.fire({
    title: 'Form Validation Errors',
    html: errorList,
    icon: 'error',
    confirmButtonText: 'Fix Errors',
    confirmButtonColor: '#ef4444'
  });
};

export const handleApiError = (error: any, defaultMessage: string = 'Something went wrong') => {
  let message = defaultMessage;
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  
  return Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#ef4444'
  });
};

export const showLoadingAlert = (title: string = 'Loading...', text: string = 'Please wait while we process your request.') => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeAlert = () => {
  Swal.close();
}; 