import { Modal, Form, Input, message } from 'antd';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { supplierService } from '../../../services/supplierService';

export default function SupplierModal({ open, onCancel, editingRecord, refreshData }) {
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
             await supplierService.update(editingRecord._id, values);
             message.success("Cập nhật nhà cung cấp thành công!");
          } else {
             await supplierService.create(values);
             message.success("Thêm mới nhà cung cấp thành công!");
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
          {editingRecord ? <><EditOutlined className="text-green-600" /> Cập Nhật Nhà Cung Cấp</> : <><PlusCircleOutlined className="text-green-500" /> Thêm Mới Nhà Cung Cấp</>}
        </div>
      }
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      width={720}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo NCC"}
      cancelText="Hủy Bỏ"
      centered
      className="rounded-2xl overflow-hidden"
      okButtonProps={{ className: "bg-green-600 hover:bg-green-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
      cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Form.Item name="name" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên Nhà Cung Cấp</span>} rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input size="large" placeholder="Ví dụ: Công ty TNHH ABC" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>

          <Form.Item name="contactPerson" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Người Liên Hệ</span>}>
            <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
          <Form.Item name="phone" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Số Điện Thoại</span>} rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
             <Input size="large" placeholder="0901234567" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>

          <Form.Item name="email" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Email</span>} rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input size="large" placeholder="email@congty.com" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>
        </div>

        <Form.Item name="address" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Địa Chỉ Đầy Đủ</span>} rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]} className="mt-2">
          <Input.TextArea rows={3} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..." className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
