import Swal, { SweetAlertIcon } from 'sweetalert2';
import '../styles/utterAlert.css';

type IconType = 'success' | 'error' | 'warning' | 'info' | 'question';

export const utterAlert = ({
  title = 'Alert',
  text = '',
  footer = '',
  icon = 'info' as IconType,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  // Add these new props:
  input = undefined as 'select' | 'text' | undefined,
  inputOptions = {} as Record<string, string>,
  inputPlaceholder = 'Select an option',
  onConfirm = (value?: string) => {},
}) => {
  return Swal.fire({
    title,
    text,
    icon: icon ? (icon as SweetAlertIcon) : undefined,
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    input,
    inputOptions,
    inputPlaceholder,
    customClass: {
      popup: 'custom-popup',
      confirmButton: 'custom-confirm-btn',
      cancelButton: 'custom-cancel-btn',
      input: 'custom-select-input',
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    footer,
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm(result.value);
    }
  });
};
