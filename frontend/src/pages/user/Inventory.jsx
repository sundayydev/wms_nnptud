import { useEffect, useState } from 'react';
import { Table, Tag, InputNumber, Button, message, Modal, Select } from 'antd';
import { WarningOutlined, PrinterOutlined } from '@ant-design/icons';
import { inventoryService } from '../../services/inventoryService';
import API_URL from '../../services/api';

const LOW_STOCK_THRESHOLD = 10;

export default function UserInventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [kiemKeModalOpen, setKiemKeModalOpen] = useState(false);
  const [kiemKeWarehouseId, setKiemKeWarehouseId] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAll();
      setInventories(data);
      // Lấy danh sách kho duy nhất từ dữ liệu tồn kho
      const seen = new Set();
      const uniqueWarehouses = [];
      data.forEach(item => {
        if (item.warehouse && !seen.has(item.warehouse._id)) {
          seen.add(item.warehouse._id);
          uniqueWarehouses.push(item.warehouse);
        }
      });
      setWarehouses(uniqueWarehouses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (id, quantity, productName) => {
    if (quantity < LOW_STOCK_THRESHOLD) {
      setPendingUpdate({ id, quantity, productName });
    } else {
      doUpdate(id, quantity);
    }
  };

  const doUpdate = async (id, quantity) => {
    try {
      await inventoryService.update(id, {
        quantity,
        lastUpdatedBy: currentUser?._id || null
      });
      message.success('Cập nhật tồn kho thành công!');
      setPendingUpdate(null);
      fetchData();
    } catch (err) {
      message.error('Cập nhật thất bại!');
    }
  };

  const columns = [
    { title: 'Sản phẩm', dataIndex: ['product', 'name'], key: 'product' },
    { title: 'SKU', dataIndex: ['product', 'sku'], key: 'sku', width: 110 },
    { title: 'Kho', dataIndex: ['warehouse', 'name'], key: 'warehouse', render: v => v || '—' },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => (
        <Tag color={qty < LOW_STOCK_THRESHOLD ? 'red' : qty < 50 ? 'orange' : 'green'}>
          {qty}
        </Tag>
      ),
    },
    {
      title: 'Cập nhật số lượng',
      key: 'action',
      render: (_, record) => {
        let newQty = record.quantity;
        return (
          <div className="flex items-center gap-2">
            <InputNumber
              min={0}
              defaultValue={record.quantity}
              onChange={(val) => { newQty = val; }}
              className="w-24"
            />
            <Button
              type="primary"
              size="small"
              onClick={() => handleSaveClick(record._id, newQty, record.product?.name)}
            >
              Lưu
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Quản Lý Tồn Kho</h1>
        <Button
          icon={<PrinterOutlined />}
          onClick={() => { setKiemKeWarehouseId(null); setKiemKeModalOpen(true); }}
          className="rounded-lg font-semibold text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
        >
          In Phiếu Kiểm Kê
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={inventories}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal cảnh báo tồn kho thấp */}
      <Modal
        open={!!pendingUpdate}
        onCancel={() => setPendingUpdate(null)}
        onOk={() => doUpdate(pendingUpdate.id, pendingUpdate.quantity)}
        okText="Vẫn lưu"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        title={
          <div className="flex items-center gap-2 text-orange-500">
            <WarningOutlined className="text-xl" />
            <span>Cảnh báo tồn kho thấp!</span>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-gray-700">
            Bạn đang cập nhật <strong>{pendingUpdate?.productName}</strong> xuống còn{' '}
            <strong className="text-red-500 text-lg">{pendingUpdate?.quantity}</strong> sản phẩm.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Số lượng dưới ngưỡng tối thiểu <strong>{LOW_STOCK_THRESHOLD}</strong> — hệ thống sẽ tự động gửi email cảnh báo cho quản lý.
          </p>
          <p className="text-gray-500 mt-1 text-sm">Bạn có chắc muốn tiếp tục?</p>
        </div>
      </Modal>

      {/* Modal chọn kho để in phiếu kiểm kê */}
      <Modal
        title={<span className="font-bold text-gray-800">In Phiếu Kiểm Kê</span>}
        open={kiemKeModalOpen}
        onCancel={() => setKiemKeModalOpen(false)}
        onOk={() => {
          const url = kiemKeWarehouseId
            ? `${API_URL}/print/inventories?warehouse=${kiemKeWarehouseId}`
            : `${API_URL}/print/inventories`;
          window.open(url, '_blank');
          setKiemKeModalOpen(false);
        }}
        okText="In Phiếu"
        cancelText="Hủy"
        okButtonProps={{ icon: <PrinterOutlined />, className: 'bg-green-600 border-0 hover:bg-green-500' }}
        centered
        width={420}
      >
        <p className="text-gray-500 mb-3">Chọn kho cần kiểm kê (bỏ trống để xuất toàn bộ):</p>
        <Select
          allowClear
          showSearch
          placeholder="Tất cả các kho"
          className="w-full"
          size="large"
          value={kiemKeWarehouseId}
          onChange={(val) => setKiemKeWarehouseId(val)}
          options={warehouses.map(w => ({ value: w._id, label: w.name }))}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        />
      </Modal>
    </div>
  );
}
