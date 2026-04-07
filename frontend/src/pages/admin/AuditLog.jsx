import { useEffect, useState } from 'react';
import { Table, Tag, Select, Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { auditLogService } from '../../services/auditLogService';

let { Option } = Select;

let actionColor = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterCollection, setFilterCollection] = useState('');

  useEffect(function () {
    fetchLogs();
  }, [filterAction, filterCollection]);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = '?';
      if (filterAction) query += 'action=' + filterAction + '&';
      if (filterCollection) query += 'collectionName=' + filterCollection + '&';
      let data = await auditLogService.getAll(query);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  let columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: function (d) {
        return new Date(d).toLocaleString('vi-VN');
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user',
      key: 'user',
      width: 160,
      render: function (u) {
        if (u) {
          return <span className="font-medium text-blue-600">{u.username}</span>;
        }
        return <span className="text-gray-400 italic">Hệ thống</span>;
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: function (a) {
        return <Tag color={actionColor[a] || 'default'}>{a}</Tag>;
      },
    },
    {
      title: 'Đối tượng',
      dataIndex: 'collectionName',
      key: 'collectionName',
      width: 120,
      render: function (c) {
        return <Tag>{c}</Tag>;
      },
    },
    {
      title: 'Chi tiết thay đổi',
      dataIndex: 'changes',
      key: 'changes',
      render: function (changes) {
        if (!changes) return '—';
        // Nếu là inventory update thì format đẹp
        if (changes.quantityBefore !== undefined) {
          return (
            <span>
              <span className="font-medium">{changes.product}</span>
              {changes.warehouse && changes.warehouse !== 'Không xác định' &&
                <span className="text-gray-400"> ({changes.warehouse})</span>
              }
              {' '}
              <span className="text-orange-500 font-bold">{changes.quantityBefore}</span>
              {' → '}
              <span className="text-green-600 font-bold">{changes.quantityAfter}</span>
            </span>
          );
        }
        return (
          <Tooltip title={JSON.stringify(changes, null, 2)}>
            <span className="text-gray-500 text-xs cursor-pointer underline">Xem chi tiết</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: function (ip) {
        return <span className="text-xs text-gray-400">{ip || '—'}</span>;
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Lịch Sử Thao Tác (Audit Log)</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchLogs}>Làm mới</Button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-3 mb-4">
        <Select
          placeholder="Lọc theo hành động"
          allowClear
          className="w-48"
          onChange={function (val) {
            setFilterAction(val || '');
          }}
        >
          <Option value="CREATE">CREATE</Option>
          <Option value="UPDATE">UPDATE</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>

        <Select
          placeholder="Lọc theo đối tượng"
          allowClear
          className="w-48"
          onChange={function (val) {
            setFilterCollection(val || '');
          }}
        >
          <Option value="inventory">Tồn kho</Option>
          <Option value="customer">Khách hàng</Option>
          <Option value="product">Sản phẩm</Option>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '50', '100'],
            showTotal: function (total) {
              return 'Tổng ' + total + ' thao tác';
            }
          }}
          rowClassName={function (record) {
            if (record.action === 'DELETE') return 'bg-red-50';
            if (record.action === 'UPDATE' && record.collectionName === 'inventory') return 'bg-blue-50';
            return '';
          }}
        />
      </div>
    </div>
  );
}
