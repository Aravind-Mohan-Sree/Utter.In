interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = 'Or' }) => {
  return (
    <div className="flex items-center">
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="px-4 text-sm text-gray-700 font-medium">{text}</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
  );
};
