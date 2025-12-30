interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'message' | 'session' | 'system';
}

interface NotificationProps {
  onClose: () => void;
}

export default function Notification({ onClose }: NotificationProps) {
  // Mock notifications
  const notifications: Notification[] = [
    {
      id: 1,
      title: 'New Message',
      message: 'John sent you a message',
      time: '2 min ago',
      read: false,
      type: 'message',
    },
    {
      id: 2,
      title: 'Session Reminder',
      message: 'Spanish lesson starts in 30 minutes',
      time: '1 hour ago',
      read: true,
      type: 'session',
    },
    {
      id: 3,
      title: 'System Update',
      message: 'New features available',
      time: '3 hours ago',
      read: true,
      type: 'system',
    },
  ];

  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-2 h-2 rounded-full ${
                  !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200">
        <button className="w-full text-center text-sm text-rose-500 font-medium hover:text-rose-600">
          Mark all as read
        </button>
      </div>
    </div>
  );
}
