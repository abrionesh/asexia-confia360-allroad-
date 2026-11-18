import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600/90 border border-emerald-400/30 px-3.5 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
        <Wifi className="w-4 h-4 text-white" />
        <span>Conexión restablecida. Sincronizando datos...</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 border border-amber-400/30 px-3.5 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <WifiOff className="w-4 h-4 text-white animate-pulse" />
      <span>Modo sin conexión — PWA activa con datos en caché.</span>
    </div>
  );
};
