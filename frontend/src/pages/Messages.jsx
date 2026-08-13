import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Tag, 
  Clock, 
  CheckCheck, 
  Search, 
  ArrowLeft,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial params if launched from a product detail page ("Contact Seller")
  const initialPartnerId = searchParams.get('partnerId');
  const initialPartnerName = searchParams.get('partnerName');
  const initialProductId = searchParams.get('productId');
  const initialProductTitle = searchParams.get('productTitle');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const chatContainerRef = useRef(null);
  const activePartnerRef = useRef(activePartner);

  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchConversations();

    // Auto refresh conversations & active chat every 4 seconds silently
    const timer = setInterval(() => {
      fetchConversations(false);
      if (activePartnerRef.current?.partnerId) {
        fetchMessages(activePartnerRef.current.partnerId);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  useEffect(() => {
    // If launched from "Message Seller" on a product detail page
    if (initialPartnerId && user && initialPartnerId !== user._id) {
      const existing = conversations.find(c => c.partnerId === initialPartnerId);
      if (existing) {
        setActivePartner(existing);
      } else if (!activePartner) {
        setActivePartner({
          partnerId: initialPartnerId,
          partnerName: initialPartnerName || 'BRACU Student',
          productId: initialProductId,
          productTitle: initialProductTitle
        });
      }
    }
  }, [initialPartnerId, initialPartnerName, initialProductId, initialProductTitle, user]);

  useEffect(() => {
    if (activePartner && user) {
      fetchMessages(activePartner.partnerId);
    }
  }, [activePartner, user]);

  // Scroll ONLY the message list container so the main browser window stays stationary
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async (showLoading = true) => {
    if (showLoading) setLoadingConversations(true);
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
        if (!activePartnerRef.current && data.length > 0 && !initialPartnerId) {
          setActivePartner(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await fetch(`/api/messages/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activePartner) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          recipientId: activePartner.partnerId,
          recipientName: activePartner.partnerName,
          productId: activePartner.productId,
          productTitle: activePartner.productTitle,
          text: textToSend
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      setMessages(prev => [...prev, data]);
      fetchConversations(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Student Messaging & Inbox</h1>
            <p className="text-xs text-slate-400">Direct instant messaging between BRACU buyers & sellers</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Conversations List + Right Chat Window */}
      <div className="glass-panel border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[620px]">
        
        {/* Left Column: Conversations List */}
        <div className="border-r border-slate-800 flex flex-col bg-slate-950/60 h-full min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-400 flex justify-between items-center shrink-0">
            <span>Conversations</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
            {loadingConversations ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading inbox...</div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                const isActive = activePartner?.partnerId === conv.partnerId;
                return (
                  <div
                    key={conv.partnerId}
                    onClick={() => setActivePartner(conv)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isActive 
                        ? 'bg-amber-500/10 border-l-4 border-amber-400' 
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                      {conv.partnerName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">{conv.partnerName}</h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {conv.productTitle && (
                        <div className="text-[10px] text-sky-400 truncate flex items-center gap-1 mb-1">
                          <Tag className="w-2.5 h-2.5" /> {conv.productTitle}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-16 px-4 text-center text-xs text-slate-500 space-y-2">
                <MessageSquare className="w-6 h-6 mx-auto text-slate-600" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-slate-600">Click "Contact Seller" on any marketplace listing to start messaging.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-2 flex flex-col bg-slate-950/90 h-full min-h-0 overflow-hidden">
          {activePartner ? (
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-sm shrink-0">
                    {activePartner.partnerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activePartner.partnerName}</h3>
                    {activePartner.productTitle && (
                      <p className="text-[11px] text-sky-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Re: {activePartner.productTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> BRACU Verified Student
                </div>
              </div>

              {/* Message Stream */}
              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 pr-2 space-y-3">
                {messages.length > 0 ? (
                  messages.map(msg => {
                    const isMe = msg.senderId === user._id;
                    return (
                      <div 
                        key={msg._id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-br-none shadow-lg' 
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-slate-500 space-y-1">
                    <p>This is the beginning of your direct conversation with <strong className="text-white">{activePartner.partnerName}</strong>.</p>
                    <p className="text-[11px] text-slate-600">Discuss price negotiation, meetup timing, or item condition details.</p>
                  </div>
                )}
              </div>

              {/* Message Input Form - Always Pinned at Bottom */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 flex gap-2 bg-slate-950 shrink-0">
                <input
                  type="text"
                  placeholder={`Write a message to ${activePartner.partnerName}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-500">
              <MessageSquare className="w-10 h-10 text-slate-700" />
              <h3 className="text-sm font-bold text-white">Select a Conversation</h3>
              <p className="text-xs max-w-xs text-slate-400">Choose an active conversation from the sidebar to view chat history and reply.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
