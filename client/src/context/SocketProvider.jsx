
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import AuthContext from "./AuthContext";
import SocketContext from "./SocketContext";

function SocketProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Disconnect when logged out
    if (!token) {
      setSocket(null);
      return;
    }

    // Connect using the logged-in user's JWT
    const connection = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    connection.on("connect", () => {
      console.log("Socket connected:", connection.id);
    });

    connection.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    setSocket(connection);

    // Disconnect when token changes or component unmounts
    return () => {
      connection.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
