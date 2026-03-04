import { GoX } from 'react-icons/go';
import { LuCircleCheck, LuCreditCard } from 'react-icons/lu';

interface Transaction {
  id: number;
  type: 'payment' | 'refund';
  description: string;
  date: string;
  amount: number;
  balanceAfter: number;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  totalBalance: number;
}

export default function TransactionHistoryModal({
  isOpen,
  onClose,
  transactions,
  totalBalance,
}: TransactionHistoryModalProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = String(date.getFullYear());
      return `${d}/${m}/${y}`;
    } catch (error) {
      console.error(error);
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-rose-100/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            Transaction History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <GoX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Total Balance */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-3xl font-bold text-gray-800">
              ₹{(totalBalance ?? 0).toLocaleString()}
            </p>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${transaction.type === 'refund'
                  ? 'border-green-100 bg-green-50'
                  : 'border-gray-100'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${transaction.type === 'refund'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {transaction.type === 'refund' ? (
                      <LuCircleCheck size={20} />
                    ) : (
                      <LuCreditCard size={20} />
                    )
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${transaction.type === 'refund'
                      ? 'text-green-600'
                      : 'text-gray-800'
                      }`}
                  >
                    {transaction.type === 'refund' ? '+' : '-'}₹
                    {Math.abs(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: ₹{(transaction.balanceAfter ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
