import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const UrgentTimer = ({ createdAt, className = "" }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 horas
      
      const difference = deadline.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (!timeLeft) return null;

  const formatTime = (value) => value.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <div className={`flex items-center gap-1 text-red-600 ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Expirado</span>
      </div>
    );
  }

  const isUrgent = timeLeft.hours < 2; // Menos de 2 horas = urgente

  return (
    <div className={`flex items-center gap-1 ${isUrgent ? 'text-red-600' : 'text-orange-600'} ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
};

export default UrgentTimer;
