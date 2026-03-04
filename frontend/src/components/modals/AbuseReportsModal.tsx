import { useState } from 'react';
import { GoX } from 'react-icons/go';

interface AbuseReport {
  id: number;
  status: 'pending' | 'resolved' | 'rejected';
  type: string;
  reportedUser: {
    name: string;
    email: string;
  };
  date: string;
  description: string;
  channel: 'video' | 'chat';
}

interface AbuseReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: AbuseReport[];
}

export default function AbuseReportsModal({
  isOpen,
  onClose,
  reports,
}: AbuseReportsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'pending' | 'resolved' | 'rejected'
  >('pending');

  if (!isOpen) return null;

  const filteredReports = reports.filter(
    (report) => report.status === activeTab,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">My Abuse Reports</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <GoX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['pending', 'resolved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'text-rose-500 border-b-2 border-rose-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="p-6">
          {filteredReports.length > 0 ? (
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            report.channel === 'video'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {report.channel.charAt(0).toUpperCase() +
                            report.channel.slice(1)}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-600">
                          {report.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">
                        Reported: {report.reportedUser.name} (
                        {report.reportedUser.email})
                      </h4>
                    </div>
                    <span className="text-sm text-gray-600">{report.date}</span>
                  </div>
                  <p className="text-gray-600">{report.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No {activeTab} reports found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
