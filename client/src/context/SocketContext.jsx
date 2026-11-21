import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    // Read socket URL only from VITE_SOCKET_URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      console.warn('[Socket.IO] VITE_SOCKET_URL not configured. Real-time updates paused.');
      return;
    }

    console.log('[Socket.IO] Connecting to:', socketUrl);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to CivicFix real-time server with ID:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from real-time server:', reason);
      setConnected(false);
    });

    socketInstance.on('complaint:new', (complaint) => {
      console.log('[Socket.IO] Received new complaint:', complaint.trackingId);
      setLatestEvent({ type: 'new', complaint, timestamp: Date.now() });
    });

    socketInstance.on('complaint:updated', (data) => {
      console.log('[Socket.IO] Complaint updated:', data.complaint?.trackingId);
      setLatestEvent({ type: 'updated', data, timestamp: Date.now() });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, latestEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
