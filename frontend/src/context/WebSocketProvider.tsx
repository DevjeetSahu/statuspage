import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type StatusData = {
  service_id: number;
  name: string;
  status: string;
  updated_at: string;
};

type WebSocketContextType = {
  latestUpdate: StatusData | null;
};

const WebSocketContext = createContext<WebSocketContextType>({
  latestUpdate: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [latestUpdate, setLatestUpdate] = useState<StatusData | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}`
    );


    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("🔄 Status Update:", data);
      setLatestUpdate(data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ latestUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};
