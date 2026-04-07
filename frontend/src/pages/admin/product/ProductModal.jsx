import { Modal, Form, Input, InputNumber, Select, message, Upload, Button } from 'antd';
import { UploadOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { productService } from '../../../services/productService';

const { TextArea } = Input;

export default function ProductModal({ open, categories = [], onCancel, editingRecord, refreshData }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue(editingRecord);
        setImagePreview(editingRecord.image || '');
      } else {
        form.resetFields();
        setImagePreview('');
      }
    }
  }, [editingRecord, form, open]);

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      setImageUploading(true);
      const data = await productService.uploadImage(file);
      form.setFieldsValue({ image: data.url, imagePublicId: data.public_id });
      setImagePreview(data.url);
      message.success('Upload ảnh lên Cloudinary thành công!');
      onSuccess?.(data);
    } catch (error) {
      message.error('Upload ảnh thất bại: ' + error);
      onError?.(new Error(error));
    } finally {
      setImageUploading(false);
    }
  };

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ hỗ trợ file ảnh!');
      return Upload.LIST_IGNORE;
    }

    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      message.error('Ảnh phải nhỏ hơn 5MB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleOk = () => {
    form.validateFields()
      .then(async (values) => {
        setIsSubmitting(true);
        try {
          if (editingRecord) {
             await productService.update(editingRecord._id, values);
             message.success("Cập nhật sản phẩm thành công!");
          } else {
             // In a real app we might pick warehouse, for now it's hardcoded as before
             const createData = { ...values, warehouse: '661c3d4e5f6a7b8c9d0e1f2a' } 
             await productService.create(createData);
             message.success("Thêm mới sản phẩm thành công!");
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
          {editingRecord ? <><EditOutlined className="text-blue-500" /> Cập Nhật Sản Phẩm</> : <><PlusCircleOutlined className="text-green-500" /> Thêm Mới Sản Phẩm</>}
        </div>
      }
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      width={780}
      okText={editingRecord ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}
      cancelText="Hủy Bỏ"
      centered
      className="rounded-2xl overflow-hidden"
      okButtonProps={{ className: "bg-blue-600 hover:bg-blue-500 shadow-md border-0 h-10 px-6 rounded-lg font-semibold" }}
      cancelButtonProps={{ className: "h-10 px-6 rounded-lg" }}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <Form.Item name="image" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="imagePublicId" hidden>
          <Input />
        </Form.Item>

        <Form.Item label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Ảnh Sản Phẩm</span>}>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="product" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 px-2 text-center">Chưa có ảnh</span>
              )}
            </div>
            <Upload
              showUploadList={false}
              customRequest={handleCustomUpload}
              beforeUpload={beforeImageUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={imageUploading}>Chọn ảnh và upload</Button>
            </Upload>
          </div>
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Form.Item name="sku" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mã SKU</span>} rules={[{ required: true, message: 'Nhập SKU' }]}>
            <Input size="large" placeholder="Ví dụ: SP-001" className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>
          <Form.Item name="name" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Tên Sản Phẩm</span>} rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input size="large" placeholder="Nhập tên sản phẩm..." className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
          </Form.Item>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
          <Form.Item name="category" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Danh Mục</span>} rules={[{ required: true, message: 'Chọn danh mục' }]}>
            <Select size="large" placeholder="-- Chọn danh mục --" className="rounded-lg">
              {categories.map(cat => (
                <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="price" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Đơn Giá</span>} rules={[{ required: true, message: 'Nhập giá' }]}>
              <InputNumber size="large" className="w-full rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="VNĐ" min={0} />
            </Form.Item>
            <Form.Item name="unit" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Đơn Vị Tính</span>} rules={[{ required: true, message: 'Nhập ĐVT' }]}>
              <Input size="large" placeholder="Cái, hộp..." className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" />
            </Form.Item>
          </div>
        </div>

        <Form.Item name="description" label={<span className="font-semibold text-gray-700 text-[13px] uppercase tracking-wide">Mô Tả Chi Tiết</span>} className="mt-2">
          <TextArea rows={4} className="rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white" placeholder="Cung cấp thông tin bổ sung về sản phẩm..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
