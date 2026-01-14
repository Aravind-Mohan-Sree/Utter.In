import { utterAlert } from "./utterAlert";

// utils/alertHelper.ts
export const utterSelectAlert = (
  title: string,
  options: Record<string, string>,
  placeholder: string,
  confirmBtnText: string,
  onConfirm: (selected: string) => void
) => {
  utterAlert({
    title,
    icon: undefined,
    input: 'select',
    inputOptions: options,
    inputPlaceholder: placeholder,
    showCancel: true,
    confirmText: confirmBtnText,
    onConfirm: (value) => {
      if (value) onConfirm(value);
    },
  });
};