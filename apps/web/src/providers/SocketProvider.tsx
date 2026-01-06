  'use client';

  import { createContext, useContext, useEffect, ReactNode } from 'react';
  import { socketService } from '@/lib/socket';
  import { useAuth } from '@/hooks/useAuth';

  interface SocketContextValue {
    isConnected: boolean;
    joinStore: (storeId: string) => void;
    leaveStore: (storeId: string) => void;
  }

  const SocketContext = createContext<SocketContextValue>({
    isConnected: false,
    joinStore: () => {},
    leaveStore: () => {},
  });

  export function useSocket() {
    return useContext(SocketContext);
  }

  interface SocketProviderProps {
    children: ReactNode;
  }

  export function SocketProvider({ children }: SocketProviderProps) {
    const { isAuthenticated, currentStore } = useAuth();

    useEffect(() => {
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
          socketService.connect(token);
        }
      } else {
        socketService.disconnect();
      }

      return () => {
        socketService.disconnect();
      };
    }, [isAuthenticated]);

    useEffect(() => {
      if (currentStore?.id && socketService.isConnected()) {
        socketService.joinStore(currentStore.id);

        return () => {
          socketService.leaveStore(currentStore.id);
        };
      }
    }, [currentStore?.id]);

    const value: SocketContextValue = {
      isConnected: socketService.isConnected(),
      joinStore: socketService.joinStore.bind(socketService),
      leaveStore: socketService.leaveStore.bind(socketService),
    };

    return (
      <SocketContext.Provider value={value}>
        {children}
      </SocketContext.Provider>
    );
  }