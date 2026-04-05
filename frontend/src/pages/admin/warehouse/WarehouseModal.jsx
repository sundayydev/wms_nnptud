import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { warehouseService } from '../../../services/warehouseService';

export default function WarehouseModal({ open, users = [], onCancel, editingRecord, refreshData }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue(editingRecord);
      } else {
        form.resetFields();
      }
    }
  }, [editingRecord, form, open]);

  const handleOk = () => {
    form.validateFields()
      .then(async (values) => {
        setIsSubmitting(true);
        try {
          if (editingRecord) {
             await warehouseService.update(editingRecord._id, values);
             message.success("Cập nhật kho thành công 🎉");
          } else {
             await warehouseService.create(values);
             message.success("Thêm mới kho thành công 🚀");
          }
          refreshData();
          onCancel();
        } catch (error) {
          message.error("Thao tác thất bại: " + error);
        } finally {
          setIsSubmitting(false);
        }
      })
      .catch(info => {
        message.warning("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      });
  };

  return (
    <Modal
      title={
        <div className="text-2xl font-extrabold text-gray-800 pb-4 border-b border-gray-100 flex items-center gap-2">
          {editingRecord ? "🏫 Cập Nhật Kho Hành" : "🏗️ Thêm Mới Kho Hàng"}
        </div>
      }
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      width={680}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Kho"}
      cancelText="Hủy Bỏ"
      centered
      className="rounded-2xl overflow-hidden"
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
      cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Form.Item name="name" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên Kho</span>} rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}>
            <Input size="large" placeholder="Ví dụ: Kho Tổng HCM" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>
          
          <Form.Item name="capacity" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Sức Chứa (m³)</span>}>
            <InputNumber size="large" className="w-full rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} placeholder="1000" />
          </Form.Item>
        </div>
        
        <Form.Item name="location" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Địa Chỉ Kho</span>} rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]} className="mt-2">
          <Input size="large" placeholder="Nhập địa chỉ đầy đủ..." className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
        </Form.Item>

        <Form.Item name="manager" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Người Quản Lý</span>} className="mt-2 text-gray-700">
          <Select size="large" placeholder="-- Chọn quản lý --" className="rounded-lg" allowClear>
            {users.map(u => (
              <Select.Option key={u._id} value={u._id}>{u.username || u.name || u.email || 'Unknown User'}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
