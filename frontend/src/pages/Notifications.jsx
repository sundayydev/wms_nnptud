import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  List,
  Space,
  Tag,
  Typography,
} from "antd";
import { notificationService } from "../services/notificationService";

const typeColor = {
  "sales-order-created": "blue",
  "message-created": "purple",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      fetchNotifications();
    },
    [unreadOnly],
  );

  async function fetchNotifications() {
    setLoading(true);
    setError("");
    try {
      let query = unreadOnly ? "?isRead=false" : "";
      let data = await notificationService.getAll(query);
      setNotifications(data);
    } catch (error) {
      setError("Không tải được thông báo: " + error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifications();
    } catch (error) {
      setError("Không thể đánh dấu đã đọc: " + error);
    }
  }

  async function handleRemove(id) {
    try {
      await notificationService.remove(id);
      await fetchNotifications();
    } catch (error) {
      setError("Không thể xóa thông báo: " + error);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thông Báo</h1>
          <p className="text-gray-500">
            Danh sách thông báo được lưu trong hệ thống.
          </p>
        </div>
        <Space>
          <Button
            onClick={function () {
              setUnreadOnly(false);
            }}
          >
            Tất cả
          </Button>
          <Button
            type={unreadOnly ? "primary" : "default"}
            onClick={function () {
              setUnreadOnly(true);
            }}
          >
            Chưa đọc
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border border-gray-100">
        {error ? (
          <Alert
            type="error"
            showIcon
            message="Không thể tải hoặc cập nhật thông báo"
            description={error}
            className="mb-4"
          />
        ) : null}
        {notifications.length ? (
          <List
            loading={loading}
            dataSource={notifications}
            rowKey="_id"
            renderItem={function (item) {
              return (
                <List.Item
                  actions={[
                    !item.isRead ? (
                      <Button
                        key="read"
                        type="link"
                        onClick={function () {
                          handleMarkAsRead(item._id);
                        }}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    ) : null,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      onClick={function () {
                        handleRemove(item._id);
                      }}
                    >
                      Xóa
                    </Button>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Typography.Text strong>{item.title}</Typography.Text>
                        <Tag color={typeColor[item.type] || "default"}>
                          {item.type}
                        </Tag>
                        {!item.isRead ? (
                          <Badge status="processing" text="Chưa đọc" />
                        ) : (
                          <Badge status="success" text="Đã đọc" />
                        )}
                      </Space>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-gray-700">{item.content}</div>
                        <div className="text-xs text-gray-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="Chưa có thông báo nào" />
        )}
      </Card>
    </div>
  );
}
