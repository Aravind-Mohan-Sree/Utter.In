import { FiArrowLeft } from 'react-icons/fi';

interface GoBackBtnProps {
  handleGoBack: () => void;
}

export const GoBackBtn: React.FC<GoBackBtnProps> = ({ handleGoBack }) => {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleGoBack}
        className="text-sm text-gray-700 hover:text-black font-medium transition-colors duration-300 flex items-center justify-center mx-auto cursor-pointer"
      >
        <FiArrowLeft />
        Go Back
      </button>
    </div>
  );
};
