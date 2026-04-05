import { Modal, Form, Input, Select, InputNumber, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { salesOrderService } from '../../../services/salesOrderService';

export default function SalesOrderModal({ open, customers = [], warehouses = [], products = [], onCancel, editingRecord, refreshData }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        // format items if they are populated objects
        const formattedData = {
          ...editingRecord,
          customer: editingRecord.customer?._id || editingRecord.customer,
          warehouse: editingRecord.warehouse?._id || editingRecord.warehouse,
          items: editingRecord.items?.map(it => ({
            product: it.product?._id || it.product,
            quantity: it.quantity,
            unitPrice: it.unitPrice
          })) || []
        };
        form.setFieldsValue(formattedData);
      } else {
        form.resetFields();
      }
    }
  }, [editingRecord, form, open]);

  const onValuesChange = (changedValues, allValues) => {
    // Auto calculate total amount
    if (changedValues.items && allValues.items) {
      const items = allValues.items || [];
      const total = items.reduce((sum, item) => {
        if (item && item.quantity && item.unitPrice) {
          return sum + (item.quantity * item.unitPrice);
        }
        return sum;
      }, 0);
      form.setFieldsValue({ totalAmount: total });
    }
  };

  const handleOk = () => {
    form.validateFields()
      .then(async (values) => {
        setIsSubmitting(true);
        try {
          if (!values.createdBy) {
             values.createdBy = "661a1b2c3d4e5f6a7b8c9d0a"; // Fallback ID if not logged in context
          }
          if (editingRecord) {
             await salesOrderService.update(editingRecord._id, values);
             message.success("Cập nhật Sales Order thành công!");
          } else {
             await salesOrderService.create(values);
             message.success("Thêm mới Sales Order thành công!");
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
        message.warning("Vui lòng điền đủ thông tin!");
      });
  };

  return (
    <Modal
      title={
        <div className="text-2xl font-extrabold text-gray-800 pb-4 border-b border-gray-100 flex items-center gap-2">
          {editingRecord ? <><EditOutlined className="text-rose-500" /> Cập Nhật Sales Order</> : <><PlusCircleOutlined className="text-green-500" /> Tạo Sales Order</>}
        </div>
      }
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      width={900}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Mã Xuất"}
      cancelText="Hủy Bỏ"
      centered
      className="rounded-2xl overflow-hidden"
      okButtonProps={{ className: "bg-rose-600 hover:bg-rose-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
      cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
    >
      <Form form={form} layout="vertical" className="mt-6" onValuesChange={onValuesChange}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
          <Form.Item name="soNumber" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mã SO</span>} rules={[{ required: true }]}>
            <Input size="large" placeholder="SO-001" className="rounded-lg bg-gray-50/50" />
          </Form.Item>
          
          <Form.Item name="status" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Trạng Thái</span>}>
            <Select size="large" className="rounded-lg" options={[{label:'Pending',value:'Pending'},{label:'Processing',value:'Processing'},{label:'Shipped',value:'Shipped'},{label:'Delivered',value:'Delivered'},{label:'Cancelled',value:'Cancelled'}]} placeholder="Pending..." />
          </Form.Item>

          <Form.Item name="customer" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Khách Hàng</span>} rules={[{ required: true }]}>
            <Select size="large" placeholder="Chọn khách hàng" className="rounded-lg">
              {customers.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="warehouse" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Xuất Từ Kho</span>} rules={[{ required: true }]}>
            <Select size="large" placeholder="Chọn kho" className="rounded-lg">
              {warehouses.map(w => <Select.Option key={w._id} value={w._id}>{w.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </div>

        <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50/30">
          <div className="font-semibold text-gray-800 text-[14px] uppercase tracking-wide mb-4">Danh Sách Xuất</div>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} className="flex mb-2" align="baseline">
                    <Form.Item {...restField} name={[name, 'product']} rules={[{ required: true, message: 'Chọn SP' }]} className="w-64">
                      <Select placeholder="Chọn sản phẩm..." className="rounded-lg">
                        {products.map(p => <Select.Option key={p._id} value={p._id}>{p.name} - {p.sku}</Select.Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập số lượng' }]}>
                      <InputNumber placeholder="SL" min={1} className="rounded-lg w-24" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true, message: 'Nhập xuất giá' }]}>
                      <InputNumber placeholder="Đơn giá" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} className="rounded-lg w-32" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 hover:text-red-700 text-lg ml-2" />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="rounded-lg mt-2 font-medium text-gray-600 border-gray-300">
                    Thêm Sản Phẩm Xuất
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>

        <div className="mt-6 flex justify-end">
          <Form.Item name="totalAmount" label={<span className="font-bold text-gray-800 text-[15px] uppercase tracking-wide">Tổng Tiền (VNĐ)</span>} className="mb-0">
             <InputNumber size="large" readOnly className="rounded-xl w-64 bg-gray-100 font-extrabold text-rose-700 text-lg text-right" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
