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
  onConfirm = () => {},
}) => {
  return Swal.fire({
    title,
    text,
    icon: icon as SweetAlertIcon,
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'custom-popup',
      title: 'custom-title',
      htmlContainer: 'custom-text',
      footer: 'custom-footer',
      icon: 'custom-icon',
      confirmButton: 'custom-confirm-btn',
      cancelButton: 'custom-cancel-btn',
    },
    buttonsStyling: false,
    backdrop: 'rgba(0,0,0,0.6)',
    allowOutsideClick: false,
    footer,
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
