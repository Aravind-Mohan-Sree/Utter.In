'use client';

import { useRouter } from 'next/navigation';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';

import { useSocketContext } from '~contexts/SocketContext';

import Avatar from './Avatar';

export default function CallInvitation() {
  const { incomingCall, setIncomingCall, socket } = useSocketContext();
  const router = useRouter();

  if (!incomingCall) return null;

  const handleAccept = () => {
    const { bookingId, type, otherId, callId } = incomingCall.signalData;
    setIncomingCall(null);
    
    let path = `/video-call/${bookingId}?type=${type}`;
    
    if (type === 'chat') {
      path += '&role=user';
    }
    
    if (otherId) {
      path += `&otherId=${otherId}`;
    }

    if (callId) {
      path += `&callId=${callId}`;
    }
    
    router.push(path);
  };

  const handleDecline = () => {
    socket?.emit('end_call', { otherPartyId: incomingCall.callerId });
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 flex flex-col items-center text-white relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
          
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <Avatar
              user={{ id: incomingCall.callerId, name: incomingCall.callerName, role: 'user' }}
              size="xl"
              interactive={false}
            />
          </div>
          
          <h3 className="text-2xl font-bold mb-1 drop-shadow-sm">{incomingCall.callerName}</h3>
          <p className="text-white/80 font-medium tracking-wide uppercase text-[10px]">Incoming Video Call</p>
        </div>

        <div className="p-10 bg-white flex justify-center gap-12">
          <button
            onClick={handleDecline}
            className="group flex flex-col items-center gap-3 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-all shadow-sm group-active:scale-95">
              <FaPhoneSlash size={24} />
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 transition-colors uppercase tracking-widest">Decline</span>
          </button>

          <button
            onClick={handleAccept}
            className="group flex flex-col items-center gap-3 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center group-hover:bg-green-600 transition-all shadow-lg shadow-green-200 group-active:scale-95 relative z-10">
                <FaPhone size={24} className="animate-bounce" />
              </div>
            </div>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
