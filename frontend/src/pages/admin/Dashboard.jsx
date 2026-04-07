import { useEffect, useState } from "react";
import { Card, List, Tag, Typography, Empty } from "antd";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(function () {
    let socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("sales-order-created", function (order) {
      setRecentOrders(function (currentOrders) {
        let nextOrders = [order, ...currentOrders];
        return nextOrders.slice(0, 5);
      });
    });

    return function () {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Thống Kê Tổng Quan</h1>
        <p className="text-gray-600">
          Theo dõi realtime đơn hàng mới vừa được tạo.
        </p>
      </div>

      <Card
        title="Live Sales Orders"
        className="shadow-sm border border-gray-100"
      >
        {recentOrders.length ? (
          <List
            dataSource={recentOrders}
            rowKey="_id"
            renderItem={function (item) {
              return (
                <List.Item>
                  <div className="flex w-full items-center justify-between gap-4">
                    <div>
                      <Typography.Text strong>
                        {item.soNumber || item._id}
                      </Typography.Text>
                      <div className="text-sm text-gray-500">
                        Total: {item.totalAmount} |{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "now"}
                      </div>
                    </div>
                    <Tag color="green">{item.status || "Pending"}</Tag>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="Chưa có đơn hàng mới trong phiên này" />
        )}
      </Card>
    </div>
  );
}
