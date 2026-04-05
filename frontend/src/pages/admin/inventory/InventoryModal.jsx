import { Modal, Form, InputNumber, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { inventoryService } from '../../../services/inventoryService';

export default function InventoryModal({ open, warehouses, products, onCancel, editingRecord, refreshData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue(editingRecord);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingRecord) {
        await inventoryService.update(editingRecord._id, {
          quantity: values.quantity
        });
        message.success("Cập nhật số lượng thành công!");
      } else {
        await inventoryService.create(values);
        message.success("Thêm mới dữ liệu tồn kho thành công!");
      }
      refreshData();
      onCancel();
    } catch (error) {
      if (error.errorFields) return; // Lỗi validate form
      message.error(typeof error === 'string' ? error : "Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
          {editingRecord ? 'Cập Nhật Số Lượng Tồn Kho' : 'Thêm Sản Phẩm Vào Kho'}
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Mới"}
      cancelText="Hủy"
      width={500}
      centered
      className="rounded-xl overflow-hidden"
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item name="warehouse" label="Thuộc Kho Hàng" rules={[{ required: true, message: 'Vui lòng chọn Kho!' }]}>
          <Select 
            placeholder="Chọn một kho hàng..." 
            size="large"
            disabled={!!editingRecord}
            showSearch
            options={warehouses.map(w => ({ value: w._id, label: w.name }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>

        <Form.Item name="product" label="Sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn Sản phẩm!' }]}>
          <Select 
            placeholder="Chọn một sản phẩm..." 
            size="large"
            disabled={!!editingRecord}
            showSearch
            options={products.map(p => ({ value: p._id, label: `${p.sku} - ${p.name}` }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        
        <Form.Item name="quantity" label="Số lượng tồn hiện tại" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
          <InputNumber min={0} size="large" className="w-full" placeholder="VD: 100" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
