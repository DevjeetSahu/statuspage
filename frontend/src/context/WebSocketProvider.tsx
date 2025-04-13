// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";

// type StatusData = {
//   service_id: number;
//   name: string;
//   status: string;
//   updated_at: string;
// };

// type WebSocketContextType = {
//   latestUpdate: StatusData | null;
// };

// const WebSocketContext = createContext<WebSocketContextType>({
//   latestUpdate: null,
// });

// export const useWebSocket = () => useContext(WebSocketContext);

// export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
//   const [latestUpdate, setLatestUpdate] = useState<StatusData | null>(null);

//   useEffect(() => {
//     const socket = new WebSocket(
//       `${import.meta.env.VITE_WS_URL}`
//     );


//     socket.onopen = () => {
//       console.log("✅ WebSocket connected");
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("🔄 Status Update:", data);
//       setLatestUpdate(data);
//     };

//     socket.onclose = () => {
//       console.log("❌ WebSocket disconnected");
//     };

//     return () => {
//       socket.close();
//     };
//   }, []);

//   return (
//     <WebSocketContext.Provider value={{ latestUpdate }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };


import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";


type StatusData = {
  model: "service";
  service_id: number;
  name: string;
  status: string;
  updated_at: string;
};

type IncidentData = {
  model: "incident";
  id: number;
  title: string;
  status: string;
  service: number;
  created_at: string;
  updated_at: string;
};

type IncidentUpdateData = {
  model: "incidentupdate";
  update_id: number;
  incident_id: number;
  message: string;
  created_at: string;
};

type WebSocketPayload = StatusData | IncidentData | IncidentUpdateData;

type WebSocketContextType = {
  latestServiceUpdate: StatusData | null;
  latestIncident: IncidentData | null;
  latestIncidentUpdate: IncidentUpdateData | null;
};


const WebSocketContext = createContext<WebSocketContextType>({
  latestServiceUpdate: null,
  latestIncident: null,
  latestIncidentUpdate: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [latestServiceUpdate, setLatestServiceUpdate] =
    useState<StatusData | null>(null);
  const [latestIncident, setLatestIncident] = useState<IncidentData | null>(
    null
  );
  const [latestIncidentUpdate, setLatestIncidentUpdate] =
    useState<IncidentUpdateData | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data: WebSocketPayload = JSON.parse(event.data);
      console.log("🔄 WebSocket Data:", data);

      switch (data.model) {
        case "service":
          setLatestServiceUpdate(data as StatusData);
          break;
        case "incident":
          setLatestIncident(data as IncidentData);
          break;
        case "incidentupdate":
          setLatestIncidentUpdate(data as IncidentUpdateData);
          break;
        default:
          console.warn("🚨 Unknown WebSocket message", data);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        latestServiceUpdate,
        latestIncident,
        latestIncidentUpdate,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
