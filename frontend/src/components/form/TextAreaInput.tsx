interface InputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  rows: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error: string;
  required?: boolean;
}

export const TextAreaInput: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  rows,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        rows={rows}
        id={id}
        name={id}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-transparent text-gray-700 mt-2 -mb-2"
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && (
        <span className="text-sm text-red-500 wrap-break-word mt-3 block">
          {error}
        </span>
      )}
    </div>
  );
};
