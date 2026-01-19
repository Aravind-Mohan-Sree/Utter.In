import Swal from 'sweetalert2';
import '../styles/utterAlert.css';

type IconType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'question'
  | undefined;

export const utterAlert = ({
  title = 'Alert',
  text = '',
  footer = '',
  icon = undefined as IconType,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  input = undefined as 'radio' | undefined,
  inputOptions = {} as Record<string, string>,
  inputPlaceholder = 'Select an option',
  onConfirm = (value?: string) => {},
}) => {
  return Swal.fire({
    title,
    text,
    ...(icon ? { icon: icon as IconType } : {}),
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    input,
    inputOptions,
    inputPlaceholder,
    customClass: {
      popup: 'custom-popup',
      icon: 'custom-icon',
      title: 'custom-title',
      input: 'custom-radio-group',
      htmlContainer: 'custom-text',
      footer: 'custom-footer',
      validationMessage: 'custom-validation-error',
      confirmButton: 'custom-confirm-btn',
      cancelButton: 'custom-cancel-btn',
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    footer,
    preConfirm: (value) => {
      if (input && !value) {
        Swal.showValidationMessage('Please select an option');
        return false;
      }
      return value;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm(result.value);
    }
  });
};
