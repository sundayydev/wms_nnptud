import { useEffect, useState } from "react";
import { Card, List, Input, Button, Typography, message } from "antd";
import { io } from "socket.io-client";
import { messageService } from "../../services/messageService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export default function UserChat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  async function loadUsers() {
    try {
      let data = await messageService.getUsers();
      let filtered = data.filter(function (item) {
        return item._id !== currentUser?._id;
      });
      setUsers(filtered);
      if (!selectedUser && filtered.length) {
        setSelectedUser(filtered[0]);
      }
    } catch (error) {
      message.error("Khong tai duoc danh sach user: " + error);
    }
  }

  async function loadMessages(userId) {
    if (!userId) return;
    try {
      let data = await messageService.getConversation(userId);
      setMessages(data);
    } catch (error) {
      message.error("Khong tai duoc noi dung chat: " + error);
    }
  }

  async function handleSend() {
    if (!selectedUser || !text.trim()) return;
    try {
      await messageService.sendMessage({
        to: selectedUser._id,
        text: text.trim(),
      });
      setText("");
      await loadMessages(selectedUser._id);
    } catch (error) {
      message.error("Gui tin nhan that bai: " + error);
    }
  }

  useEffect(function () {
    loadUsers();
  }, []);

  useEffect(
    function () {
      if (selectedUser?._id) {
        loadMessages(selectedUser._id);
      }
    },
    [selectedUser?._id],
  );

  useEffect(
    function () {
      let token = localStorage.getItem("token");
      if (!token) return;

      let socket = io(SOCKET_URL);
      socket.emit("welcome", { auth: token });
      socket.on("newMess", function () {
        if (selectedUser?._id) {
          loadMessages(selectedUser._id);
        }
      });

      return function () {
        socket.disconnect();
      };
    },
    [selectedUser?._id],
  );

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Chat Noi Bo</h1>
        <p className="text-gray-500">
          Trao doi nhanh voi user khac trong he thong.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Danh Sach User" className="md:col-span-1">
          <List
            dataSource={users}
            rowKey="_id"
            renderItem={function (item) {
              return (
                <List.Item
                  className={`cursor-pointer rounded px-2 ${selectedUser?._id === item._id ? "bg-blue-50" : ""}`}
                  onClick={function () {
                    setSelectedUser(item);
                  }}
                >
                  <Typography.Text strong>
                    {item.fullName || item.username}
                  </Typography.Text>
                </List.Item>
              );
            }}
          />
        </Card>

        <Card
          title={
            selectedUser
              ? `Chat voi ${selectedUser.fullName || selectedUser.username}`
              : "Chat"
          }
          className="md:col-span-2"
        >
          <div className="h-80 overflow-y-auto border border-gray-100 rounded p-3 mb-3 bg-gray-50">
            <List
              dataSource={messages}
              rowKey="_id"
              renderItem={function (item) {
                let mine = item.from && item.from._id === currentUser?._id;
                return (
                  <List.Item className="border-0 py-1">
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded ${mine ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-white border border-gray-200"}`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {item.from?.username || "unknown"}
                      </div>
                      <div>{item.messageContent}</div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>

          <div className="flex gap-2">
            <Input
              value={text}
              onChange={function (e) {
                setText(e.target.value);
              }}
              onPressEnter={handleSend}
              placeholder="Nhap tin nhan..."
            />
            <Button type="primary" onClick={handleSend}>
              Gui
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
