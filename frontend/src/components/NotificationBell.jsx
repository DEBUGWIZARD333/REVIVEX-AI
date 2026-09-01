import { useState, useEffect } from 'react';
import { Bell, Check, MessageSquare, Tag, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [latestToast, setLatestToast] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const list = data.data;
        setNotifications(list);
        const count = list.filter((n) => !n.isRead).length;
        setUnreadCount(count);

        // Show live popup toast for newest unread notification
        if (list.length > 0 && !list[0].isRead) {
          setLatestToast(list[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setLatestToast(null);
    } catch (err) {
      console.warn('Mark read error:', err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-600 hover:text-brand-600 p-2 rounded-xl hover:bg-slate-100 transition"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Live Toast Alert Popup when new recovery notification arrives */}
      {latestToast && !isOpen && (
        <div className="fixed top-20 right-5 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-brand-500 flex items-start space-x-3 animate-bounce">
          <div className="p-2 bg-brand-600 text-white rounded-xl flex-shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-brand-400 uppercase tracking-wider text-[10px]">
                New Recovery Alert
              </span>
              <button
                onClick={() => setLatestToast(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <p className="font-bold text-slate-100">{latestToast.title || 'Cart Recovery Notification'}</p>
            <p className="text-slate-300 text-[11px] leading-tight">{latestToast.message}</p>
          </div>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Bell size={18} className="text-brand-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center"
              >
                <Check size={12} className="mr-1" /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`pt-2 text-xs space-y-1 ${!n.isRead ? 'bg-brand-50/50 p-2.5 rounded-2xl border border-brand-100' : 'p-2'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900">{n.title || 'Recovery Notification'}</span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationBell;
