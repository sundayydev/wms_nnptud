import { useEffect, useState } from "react";
import { Badge, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { notificationService } from "../services/notificationService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export default function NotificationBell({ to }) {
  const [count, setCount] = useState(0);

  useEffect(function () {
    async function fetchCount() {
      try {
        let data = await notificationService.getUnreadCount();
        setCount(data.count || 0);
      } catch (error) {
        setCount(0);
      }
    }

    let socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", function () {
      let token = localStorage.getItem("token");
      if (token) {
        socket.emit("welcome", { auth: token });
      }
    });

    socket.on("notification-created", function () {
      fetchCount();
    });

    fetchCount();

    return function () {
      socket.disconnect();
    };
  }, []);

  return (
    <Link to={to}>
      <Badge count={count} size="small" offset={[-2, 2]}>
        <Button shape="circle" icon={<BellOutlined />} />
      </Badge>
    </Link>
  );
}
