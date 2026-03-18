'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaPaperPlane, FaVideo, FaCircle, FaUserCircle, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import { useSocketContext } from '~contexts/SocketContext';
import { getConversations, getMessages, sendMessage, searchChat, editMessage, deleteMessage } from '~services/user/chatService';
import { MdEdit, MdDelete, MdContentCopy } from 'react-icons/md';
import { setUnreadCount } from '~features/chatSlice';
import { RootState } from '~store/rootReducer';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import { utterAlert } from '~utils/utterAlert';
import Loader from '~components/ui/Loader';
import Image from 'next/image';
import { API_ROUTES } from '~constants/routes';
import Avatar from '~components/ui/Avatar';

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  conversationId: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  hiddenBy?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount?: Record<string, number>;
  otherUser?: User;
}

export default function ChatsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { socket, onlineUsers } = useSocketContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ conversations: Conversation[]; messages: Message[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isJumpingRef = useRef(false);
  const lastProcessedQueryIdRef = useRef<string | null>(null);

  const handleSelectConversation = (conv: Conversation | null, targetMsgId?: string) => {
    if (userIdFromQuery && (!conv || String(conv.otherUser?.id) !== userIdFromQuery)) {
      router.replace('/chats');
    }

    setSelectedConversation(conv);

    if (conv) {
      setSearchResults(null);
      setSearchQuery('');
      if (targetMsgId) {
        setHighlightedMessageId(targetMsgId);
        isJumpingRef.current = true;
      } else {
        isJumpingRef.current = false;
      }
    }
    if (conv && conv.id !== 'new') {
      const currentUnread = conv.unreadCount?.[user?.id!] || 0;
      if (currentUnread > 0) {
        const updatedConversations = conversations.map(c =>
          c.id === conv.id
            ? { ...c, unreadCount: { ...c.unreadCount, [user?.id!]: 0 } }
            : c
        );
        setConversations(updatedConversations);
        const totalUnread = updatedConversations.reduce((acc, c) => acc + (c.unreadCount?.[user?.id!] || 0), 0);
        dispatch(setUnreadCount(totalUnread));
      }
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation && selectedConversation.id !== 'new') {
      fetchMessages(selectedConversation.id, 1, highlightedMessageId || undefined);
    } else if (selectedConversation?.id === 'new') {
      setMessages([]);
      setPage(1);
      setHasMore(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message: Message) => {
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages((prev) => [...prev, message]);
          getMessages(selectedConversation.id).catch(() => { });
        }

        fetchConversations();
      });

      socket.on('message_edited', (message: Message) => {
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages((prev) => prev.map((m) => m.id === message.id ? message : m));
        }
        fetchConversations();
      });

      socket.on('message_deleted', (message: Message) => {
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages((prev) => prev.map((m) => m.id === message.id ? message : m));
        }
        fetchConversations();
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_edited');
        socket.off('message_deleted');
      };
    }
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (page === 1 && !isJumpingRef.current && !messagesLoading) {
      scrollToBottom();
    }
  }, [messages, page, messagesLoading]);

  useEffect(() => {
    if (highlightedMessageId && messages.length > 0) {
      const element = document.getElementById(`msg-${highlightedMessageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const timer = setTimeout(() => {
          setHighlightedMessageId(null);
          isJumpingRef.current = false;
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [messages, highlightedMessageId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isFetchingMore && !messagesLoading && selectedConversation?.id !== 'new') {
      loadMoreMessages();
    }
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || selectedConversation.id === 'new' || !hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    const container = messagesContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;

    try {
      const nextPage = page + 1;
      const res = await getMessages(selectedConversation.id, { page: nextPage });

      if (res.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...res.messages, ...prev]);
        setPage(nextPage);
        if (res.messages.length < 30) setHasMore(false);

        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - oldScrollHeight;
          }
        }, 0);
      }
    } catch (err) {
      utterToast.error(errorHandler(err));
    } finally {
      setIsFetchingMore(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      const mapped = res.conversations.map((c: any) => {
        const otherParticipant = c.participantsData?.find((p: any) => String(p._id) !== String(user?.id));
        const isSelected = selectedConversation && (String(selectedConversation.id) === String(c._id) || String(selectedConversation.id) === String(c.id));

        return {
          ...c,
          unreadCount: isSelected
            ? { ...c.unreadCount, [user?.id!]: 0 }
            : c.unreadCount,
          otherUser: otherParticipant ? {
            id: String(otherParticipant._id),
            name: otherParticipant.name,
          } : undefined
        };
      });
      setConversations(mapped);
      const totalUnread = mapped.reduce((acc: number, conv: any) => acc + (conv.unreadCount?.[user?.id!] || 0), 0);
      dispatch(setUnreadCount(totalUnread));
    } catch (err) {
      utterToast.error(errorHandler(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string, pageNum: number = 1, targetId?: string) => {
    if (convId === 'new') return;
    setMessagesLoading(true);
    try {
      const res = await getMessages(convId, {
        page: targetId ? undefined : pageNum,
        limit: 30,
        targetId
      });
      setMessages(res.messages);
      setPage(res.page);
      setHasMore(res.messages.length >= 30);
      fetchConversations();
    } catch (err) {
      utterToast.error(errorHandler(err));
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !selectedConversation.otherUser) return;

    try {
      const res = await sendMessage(selectedConversation.otherUser.id, newMessage);
      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');

      socket?.emit('send_message', {
        receiverId: selectedConversation.otherUser.id,
        message: res.message
      });

      fetchConversations();
    } catch (err) {
      utterToast.error(errorHandler(err));
    }
  };

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, messageId: string, _senderId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg?.isDeleted || editingMessageId === messageId) return;

    e.preventDefault();
    e.stopPropagation();

    let x, y;
    if ('clientX' in e) {
      x = e.clientX;
      y = e.clientY;
    } else {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }

    const menuWidth = 260;
    const menuHeight = 220;
    const padding = 16;

    x = Math.max(padding, Math.min(x, window.innerWidth - menuWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - menuHeight - padding));

    setContextMenu({ x, y, messageId });
  };

  const handleEditMessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      setEditingMessageId(messageId);
      setEditValue(msg.text);
    }
    setContextMenu(null);
  };

  const handleCopyMessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      navigator.clipboard.writeText(msg.text);
      utterToast.success('Message copied to clipboard');
    }
    setContextMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editValue.trim()) return;
    try {
      const res = await editMessage(editingMessageId, editValue);
      setMessages((prev) => prev.map((m) => m.id === editingMessageId ? res.message : m));
      socket?.emit('edit_message', {
        receiverId: selectedConversation?.otherUser?.id,
        message: res.message
      });
      setEditingMessageId(null);
      fetchConversations();
    } catch (err) {
      utterToast.error(errorHandler(err));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const isSender = msg.senderId === user?.id;
    const createdAt = new Date(msg.createdAt).getTime();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const isWithinTwoDays = Date.now() - createdAt < TWO_DAYS;

    const confirmTitle = isSender && isWithinTwoDays ? 'Delete for Everyone?' : 'Delete for Me?';
    const confirmText = isSender && isWithinTwoDays
      ? 'This will delete the message for both you and the recipient.'
      : 'This will only remove the message from your view.';

    utterAlert({
      title: confirmTitle,
      text: confirmText,
      icon: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await deleteMessage(messageId);
          setMessages((prev) => prev.map((m) => m.id === messageId ? res.message : m));
          socket?.emit('delete_message', {
            receiverId: selectedConversation?.otherUser?.id,
            message: res.message
          });
          setContextMenu(null);
          fetchConversations();
          utterToast.success(isSender && isWithinTwoDays ? 'Message deleted for everyone' : 'Message hidden');
        } catch (err) {
          utterToast.error(errorHandler(err));
        }
      }
    });
  };

  const selectOrStartChat = (otherUser: User) => {
    const existing = conversations.find((c) => String(c.otherUser?.id) === String(otherUser.id));
    if (existing) {
      handleSelectConversation(existing);
    } else {
      handleSelectConversation({
        id: 'new',
        participants: [user!.id, otherUser.id],
        otherUser,
      });
    }
    setSearchResults(null);
    setSearchQuery('');
  };

  const isMessageEditable = (createdAt: string) => {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() < FIFTEEN_MINUTES;
  };

  const isWithinTwoDays = (createdAt: string) => {
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() < TWO_DAYS;
  };

  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');

  useEffect(() => {
    if (userIdFromQuery && !loading && conversations.length >= 0 && userIdFromQuery !== lastProcessedQueryIdRef.current) {
      if (selectedConversation && String(selectedConversation.otherUser?.id) === userIdFromQuery) {
        lastProcessedQueryIdRef.current = userIdFromQuery;
        return;
      }

      const existing = conversations.find(c => String(c.otherUser?.id) === userIdFromQuery);
      if (existing) {
        setSelectedConversation(existing);
        lastProcessedQueryIdRef.current = userIdFromQuery;
      } else {
        (async () => {
          try {
            const exactRes = await searchChat({ q: userIdFromQuery });
            const found = exactRes.users.find((u: any) => String(u.id) === userIdFromQuery);
            if (found) {
              selectOrStartChat({
                id: found.id,
                name: found.name,
              });
              lastProcessedQueryIdRef.current = userIdFromQuery;
            }
          } catch (err) { }
        })();
      }
    }

    if (!userIdFromQuery) {
      lastProcessedQueryIdRef.current = null;
    }
  }, [userIdFromQuery, conversations, loading, selectedConversation]);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }

    const query = val.toLowerCase();

    const matchingConvs = conversations.filter(c =>
      c.otherUser?.name.toLowerCase().includes(query)
    );

    try {
      const res = await searchChat({ q: val });
      setSearchResults({
        conversations: matchingConvs,
        messages: res.messages.filter((msg: Message) =>
          conversations.some(c => c.id === msg.conversationId)
        )
      });
    } catch (err) {
      setSearchResults({ conversations: matchingConvs, messages: [] });
    }
  };

  const startVideoCall = () => {
    if (!selectedConversation || !selectedConversation.otherUser) return;
    router.push(`/video-call/${selectedConversation.id}?role=user&type=chat&otherId=${selectedConversation.otherUser.id}`);
  };

  const isOnline = (userId: string) => onlineUsers.has(userId);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-64px)] md:mt-16 mt-[64px] bg-white sm:border-l sm:border-r border-gray-100 overflow-hidden">
          {/* Sidebar */}
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-100 flex-col bg-gray-50/30 shrink-0`}>
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Chats</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search chats or messages..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:text-gray-400 text-black"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {searchResults ? (
                <div className="p-2">
                  {searchResults.conversations.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Conversations</p>
                      {searchResults.conversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className="cursor-pointer w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all text-left"
                        >
                          <div className="relative">
                            <Avatar
                              user={{
                                id: conv.otherUser?.id,
                                name: conv.otherUser?.name || '',
                                role: 'user'
                              }}
                              size="md"
                              interactive={false}
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline(String(conv.otherUser?.id)) ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 truncate">{conv.otherUser?.name}</h4>
                            <p className="text-[11px] text-gray-500 truncate">{conv.lastMessageText}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {searchResults.conversations.length === 0 && searchResults.messages.length === 0 && (
                    <p className="text-[10px] text-gray-400 px-3 py-1 text-center mt-4">No results found</p>
                  )}

                  {searchResults.messages.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2 mt-4">Messages</p>
                      {searchResults.messages.map(msg => {
                        const conv = conversations.find(c => c.id === msg.conversationId);
                        if (!conv) return null;
                        return (
                          <button
                            key={msg.id}
                            onClick={() => handleSelectConversation(conv, msg.id)}
                            className="cursor-pointer w-full flex flex-col gap-1 p-3 hover:bg-white rounded-xl transition-all text-left"
                          >
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-gray-800">{conv.otherUser?.name}</h4>
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 italic">"{msg.text}"</p>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`cursor-pointer w-full flex items-center gap-3 p-4 border-b border-gray-50 transition-all text-left ${selectedConversation?.id === conv.id ? 'bg-white shadow-sm z-10' : 'hover:bg-white/50'
                      }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        user={{
                          id: conv.otherUser?.id,
                          name: conv.otherUser?.name || '',
                          role: 'user'
                        }}
                        size="sm"
                        interactive={false}
                      />
                      {conv.otherUser && (
                        <div className={`absolute -bottom-0.5 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline(String(conv.otherUser.id)) ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-gray-800 truncate">{conv.otherUser?.name}</h4>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessageText || 'No messages yet'}</p>
                    </div>
                    {(conv.unreadCount?.[user?.id!] ?? 0) > 0 && (
                      <div className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount?.[user?.id!]}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white min-w-0 relative`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-20">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectConversation(null)}
                      className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaArrowLeft size={18} />
                    </button>
                    <Avatar
                      user={{
                        id: selectedConversation.otherUser?.id,
                        name: selectedConversation.otherUser?.name || '',
                        role: 'user'
                      }}
                      size="sm"
                      editable={false}
                      interactive={true}
                    />
                    <div>
                      <h3 className="text-base font-bold text-gray-800 leading-tight">{selectedConversation.otherUser?.name}</h3>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        {selectedConversation.otherUser && onlineUsers.has(String(selectedConversation.otherUser.id)) ? (
                          <><FaCircle className="text-green-500 translate-y-[.5px]" size={8} /> Online</>
                        ) : (
                          <><FaCircle className="text-red-500 translate-y-[.5px]" size={8} /> Offline</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startVideoCall}
                    className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl transition-all shadow-sm active:scale-95"
                    title="Start Video Call"
                  >
                    <FaVideo size={18} />
                  </button>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 py-6 bg-gray-50/20 no-scrollbar scroll-smooth"
                  onScroll={handleScroll}
                >
                  {isFetchingMore && (
                    <div className="flex justify-center py-2">
                      <div className="w-5 h-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm font-medium">Say hello to {selectedConversation.otherUser?.name}!</p>
                    </div>
                  ) : (
                    messages.filter(msg => !msg.hiddenBy?.includes(user?.id!)).map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      const isHighlighted = highlightedMessageId === msg.id;
                      return (
                        <div
                          key={msg.id || idx}
                          id={`msg-${msg.id}`}
                          className={`flex w-full px-6 py-1 transition-colors duration-1000 ${isMe ? 'justify-end' : 'justify-start'
                            } ${isHighlighted ? 'bg-rose-500/10' : ''}`}
                        >
                          <div
                            className={`relative group max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm select-none transition-all ${!msg.isDeleted ? 'cursor-pointer' : 'cursor-default'
                              } ${isMe ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                              }`}
                            onContextMenu={(e) => handleContextMenu(e, msg.id, msg.senderId)}
                            onTouchStart={(e) => {
                              if (msg.isDeleted || editingMessageId === msg.id) return;
                              const timer = setTimeout(() => handleContextMenu(e, msg.id, msg.senderId), 500);
                              e.currentTarget.addEventListener('touchend', () => clearTimeout(timer), { once: true });
                              e.currentTarget.addEventListener('touchmove', () => clearTimeout(timer), { once: true });
                            }}
                          >
                            {editingMessageId === msg.id ? (
                              <div className="flex flex-col gap-2 min-w-[140px] w-64 max-w-full">
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full bg-white/10 text-white p-2 rounded-xl border border-white/20 focus:outline-none resize-none no-scrollbar overflow-y-auto text-sm max-h-32"
                                  rows={2}
                                  autoFocus
                                  onInput={(e) => {
                                    e.currentTarget.style.height = 'auto';
                                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit();
                                    }
                                  }}
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingMessageId(null)} className="text-[10px] hover:underline cursor-pointer">Cancel</button>
                                  <button onClick={handleSaveEdit} className="text-[10px] bg-white text-rose-500 px-3 py-1.5 rounded-lg font-bold shadow-sm active:scale-95 transition-all cursor-pointer">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className={`break-words whitespace-pre-wrap ${msg.isDeleted ? `italic ${isMe ? 'text-white/70' : 'text-gray-400'}` : ''}`}>{msg.text}</p>
                                <div className={`flex justify-end items-center gap-1.5 mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                  {msg.isEdited && !msg.isDeleted && <span>(edited)</span>}
                                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollBottom && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 p-3 bg-white text-rose-500 border border-gray-100 rounded-full shadow-lg hover:bg-rose-50 transition-all active:scale-95 animate-bounce flex items-center justify-center cursor-pointer group"
                    title="Scroll to bottom"
                  >
                    <FaChevronDown size={14} />
                  </button>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={textareaRef}
                      placeholder="Type a message..."
                      className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/50 outline-none transition-all placeholder:text-gray-400 shadow-inner text-black resize-none max-h-32 min-h-[46px] overflow-y-auto no-scrollbar"
                      rows={1}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="cursor-pointer h-[46px] w-[46px] shrink-0 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 disabled:opacity-40 active:scale-95 flex items-center justify-center"
                    >
                      <FaPaperPlane size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-rose-500/30" size={32} />
                </div>
                <p className="text-xs max-w-xs text-center mt-2 leading-relaxed">Select a conversation or search for members to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[160px]"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {messages.find((m) => m.id === contextMenu.messageId) && (
            <>
              {/* Copy Option (Available for all) */}
              <button
                onClick={() => handleCopyMessage(contextMenu.messageId)}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left whitespace-nowrap"
              >
                <MdContentCopy className="text-gray-400" /> Copy
              </button>

              {/* Edit Option (Only for sender) */}
              {messages.find((m) => m.id === contextMenu.messageId)!.senderId === user?.id &&
                isMessageEditable(messages.find((m) => m.id === contextMenu.messageId)!.createdAt) && (
                  <button
                    onClick={() => handleEditMessage(contextMenu.messageId)}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left whitespace-nowrap"
                  >
                    <MdEdit className="text-gray-400" /> Edit
                  </button>
                )}

              {/* Delete Option */}
              <button
                onClick={() => handleDeleteMessage(contextMenu.messageId)}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-gray-50 text-left whitespace-nowrap"
              >
                <MdDelete className="text-rose-400" />
                {messages.find((m) => m.id === contextMenu.messageId)!.senderId === user?.id &&
                  isWithinTwoDays(messages.find((m) => m.id === contextMenu.messageId)!.createdAt)
                  ? 'Delete for Everyone'
                  : 'Delete for Me'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Global click to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        />
      )}
    </>
  );
}
