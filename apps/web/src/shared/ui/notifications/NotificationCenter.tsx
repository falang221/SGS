import React, { useEffect, useState } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

type RealtimeSocket = import('socket.io-client').Socket;

interface Notification {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: Date;
}

const NotificationCenter: React.FC = () => {
  const { user, tenantId } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !tenantId) return;

    let isDisposed = false;
    let socket: RealtimeSocket | null = null;

    const setupRealtime = async () => {
      const { io } = await import('socket.io-client');
      if (isDisposed) return;

      socket = io(window.location.origin, {
        path: '/socket.io'
      });

      // Rejoindre le canal du tenant et de l'utilisateur (Section 6.2)
      socket.emit('join', tenantId);
      if (user.id) socket.emit('join', `user-${user.id}`);

      socket.on('notification', (notif: Notification) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Notification navigateur native (Optionnelle)
        if (window.Notification?.permission === 'granted') {
          new window.Notification(notif.title, { body: notif.message });
        }
      });
    };

    void setupRealtime();

    return () => {
      isDisposed = true;
      socket?.disconnect();
    };
  }, [user, tenantId]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  const IconMap = {
    INFO: Info,
    SUCCESS: CheckCircle,
    WARNING: AlertTriangle,
    ERROR: XCircle,
  };

  const ColorMap = {
    INFO: 'text-blue-600',
    SUCCESS: 'text-green-600',
    WARNING: 'text-amber-600',
    ERROR: 'text-red-600',
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Temps Réel</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Aucune notification pour le moment
              </div>
            ) : (
              notifications.map((n, i) => {
                const Icon = IconMap[n.type];
                return (
                  <div key={i} className="p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      <Icon size={18} className={ColorMap[n.type]} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                           {new Date(n.timestamp).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
