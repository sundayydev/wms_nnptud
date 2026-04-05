import { Modal, Form, Select, Upload, Button, message, Alert, notification } from 'antd';
import { InboxOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useState } from 'react';
import API_URL from '../../../services/api';

const { Dragger } = Upload;

export default function ImportExcelModal({ open, warehouses = [], onCancel, refreshData }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.warning("Vui lòng chọn file Excel để tải lên.");
        return;
      }
      
      const formData = new FormData();
      formData.append('file', fileList[0]);
      formData.append('warehouse', values.warehouse);

      setUploading(true);

      const response = await fetch(`${API_URL}/upload/excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Nếu hệ thống dùng token
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // API trả về mảng kết quả từng dòng
        if (Array.isArray(data)) {
          const successRows = data.filter(r => r.success);
          const errorRows = data.filter(r => !r.success);
          
          if (successRows.length > 0) {
            message.success(`Import thành công ${successRows.length} dòng!`);
          }
          
          if (errorRows.length > 0) {
            const errorDetails = errorRows.map((err, idx) => `Dòng lỗi: ${Array.isArray(err.data) ? err.data.join(', ') : err.data}`).join(' | ');
            notification.warning({
              message: `Đã bỏ qua ${errorRows.length} dòng bị lỗi`,
              description: errorDetails,
              duration: 10
            });
          }
          
          if (successRows.length === 0 && errorRows.length === 0) {
            message.warning("File Excel hợp lệ nhưng không có dữ liệu để import.");
          }
        } else if (data.message) {
          message.success(data.message);
        } else {
          message.success("Import thành công!");
        }
        
        setFileList([]);
        form.resetFields();
        refreshData();
        onCancel();
      } else {
        message.error(data.message || "Lỗi khi xử lý file Excel, vui lòng kiểm tra lại cấu trúc file.");
      }
    } catch (error) {
      if (error.errorFields) return; // Validation error
      message.error("Lỗi Upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    beforeUpload: (file) => {
      // Check if file is excel
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error("Bạn chỉ có thể tải lên file .xlsx hoặc .xls!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title={
        <div className="text-xl font-extrabold text-green-700 flex items-center gap-2 pb-2 border-b border-gray-100">
          <FileExcelOutlined /> Import Dữ Liệu Từ Excel
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} className="rounded-lg">Hủy</Button>,
        <Button key="submit" type="primary" loading={uploading} onClick={handleUpload} className="bg-green-600 hover:bg-green-500 rounded-lg">
          Bắt Đầu Import
        </Button>,
      ]}
      width={600}
      centered
      className="rounded-2xl overflow-hidden"
    >
      <div className="pt-4 pb-2">
        <Alert 
          title="Hướng dẫn Import" 
          description="Chỉ tải lên file danh sách hàng hoá, vật tư sử dụng định dạng theo mẫu .xlsx chuẩn của hệ thống. Bạn cần gán toàn bộ lô hàng trong file này vào một kho cụ thể." 
          type="info" 
          showIcon 
          className="mb-6 rounded-lg bg-blue-50 border-blue-200" 
        />
        
        <Form form={form} layout="vertical">
          <Form.Item 
            name="warehouse" 
            label={<span className="font-semibold text-gray-700">Chọn kho đích để nhập toàn bộ hàng:</span>} 
            rules={[{ required: true, message: 'Kho nhập là bắt buộc!' }]}
          >
            <Select size="large" placeholder="Vui lòng chọn Kho..." className="rounded-lg">
              {warehouses.map(w => (
                <Select.Option key={w._id} value={w._id}>{w.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={<span className="font-semibold text-gray-700">File Excel Import:</span>} required>
            {fileList.length === 0 ? (
              <Dragger {...uploadProps} className="bg-gray-50 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition w-full rounded-xl">
                <p className="ant-upload-drag-icon pt-4">
                  <InboxOutlined className="text-green-500 text-4xl" />
                </p>
                <p className="ant-upload-text font-bold text-gray-600">Nhấp hoặc kéo thả file vào đây</p>
                <p className="ant-upload-hint text-gray-400 pb-4">
                  Chỉ hỗ trợ file tải xuống từ mẫu Export Template.
                </p>
              </Dragger>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600 text-xl">
                    <FileExcelOutlined />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 m-0 leading-tight">{fileList[0].name}</p>
                    <p className="text-gray-500 text-xs m-0 mt-1">{(fileList[0].size / 1024).toFixed(2)} KB • Đã sẵn sàng</p>
                  </div>
                </div>
                <Button 
                  size="small" 
                  danger 
                  onClick={() => setFileList([])} 
                  className="rounded-md font-medium px-3"
                >
                  Thay đổi file
                </Button>
              </div>
            )}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
