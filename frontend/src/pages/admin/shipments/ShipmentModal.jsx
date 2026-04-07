import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { shipmentService } from '../../../services/shipmentService';
import dayjs from 'dayjs';

export default function ShipmentModal({ open, salesOrders = [], onCancel, editingRecord, refreshData }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        const formattedData = {
          ...editingRecord,
          order: editingRecord.order?._id || editingRecord.order,
          shippedDate: editingRecord.shippedDate ? dayjs(editingRecord.shippedDate) : null,
          estimatedDelivery: editingRecord.estimatedDelivery ? dayjs(editingRecord.estimatedDelivery) : null,
        };
        form.setFieldsValue(formattedData);
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
            // Extract the date strings if available
            const formatData = {
                ...values,
                shippedDate: values.shippedDate ? values.shippedDate.toISOString() : null,
                estimatedDelivery: values.estimatedDelivery ? values.estimatedDelivery.toISOString() : null
            };

          if (editingRecord) {
             await shipmentService.update(editingRecord._id, formatData);
             message.success("Cập nhật Vận đơn thành công!");
          } else {
             await shipmentService.create(formatData);
             message.success("Thêm mới Vận đơn thành công!");
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
          {editingRecord ? <><EditOutlined className="text-blue-500" /> Cập Nhật Vận Đơn</> : <><PlusCircleOutlined className="text-green-500" /> Tạo Vận Đơn</>}
        </div>
      }
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      width={700}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Mới"}
      cancelText="Hủy Bỏ"
      centered
      className="rounded-2xl overflow-hidden"
      okButtonProps={{ className: "bg-blue-600 hover:bg-blue-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
      cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item name="order" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Đơn Hàng (Sales Order)</span>} rules={[{ required: true }]}>
            <Select size="large" placeholder="Chọn SO..." className="rounded-lg">
                {salesOrders.map(so => <Select.Option key={so._id} value={so._id}>{so.soNumber}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="status" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Trạng Thái Giao Hàng</span>}>
            <Select size="large" className="rounded-lg" options={[{label:'Preparing',value:'Preparing'},{label:'In Transit',value:'In Transit'},{label:'Delivered',value:'Delivered'},{label:'Failed',value:'Failed'}]} placeholder="Preparing..." />
          </Form.Item>

          <Form.Item name="trackingNumber" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mã Vận Đơn (Tracking No.)</span>}>
            <Input size="large" placeholder="VD: GHTK-001..." className="rounded-lg bg-gray-50/50" />
          </Form.Item>
          
          <Form.Item name="carrier" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Đối Tác Vận Chuyển</span>}>
            <Input size="large" placeholder="VD: GHTK, GHN, ViettelPost..." className="rounded-lg bg-gray-50/50" />
          </Form.Item>

          <Form.Item name="shippedDate" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Ngày Xuất Kho</span>}>
            <DatePicker size="large" className="w-full rounded-lg" format="DD/MM/YYYY" placeholder="Chọn ngày" />
          </Form.Item>

           <Form.Item name="estimatedDelivery" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Ngày Giao Tới (Dự Kiến)</span>}>
            <DatePicker size="large" className="w-full rounded-lg" format="DD/MM/YYYY" placeholder="Chọn ngày" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
