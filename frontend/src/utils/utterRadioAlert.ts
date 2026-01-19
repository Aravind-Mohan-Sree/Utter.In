import { utterAlert } from './utterAlert';

export const utterRadioAlert = (
  title: string,
  options: Record<string, string>,
  confirmBtnText: string,
  onConfirm: (selected: string) => void,
) => {
  utterAlert({
    title,
    input: 'radio',
    inputOptions: options,
    showCancel: true,
    confirmText: confirmBtnText,
    onConfirm: (value) => {
      if (value) onConfirm(value);
    },
  });
};
