interface InputFieldProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-transparent text-gray-700"
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <span className="text-sm text-red-500 wrap-break-word">{error}</span>}
    </div>
  );
};
