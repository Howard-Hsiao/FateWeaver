import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button, Select, Space, Checkbox, Divider, theme } from 'antd';
import { DeleteOutlined, DeleteTwoTone, PlusOutlined } from '@ant-design/icons';
import { DEFAULT_COLORS } from '../configs/constants';

const SideDrawer = ({ open, onClose, groups, onGroupsChange }) => {
  const [localGroups, setLocalGroups] = useState(groups);
  const {
    token: { colorBgContainer, colorText, colorBorderSecondary },
  } = theme.useToken();

  useEffect(() => {
    if (open) {
      setLocalGroups(groups);
    }
  }, [open, groups]);

  const addGroup = () => {
    const newGroup = {
      fields: ['', ''],
      color: DEFAULT_COLORS[localGroups.length % DEFAULT_COLORS.length],
      enabled: true,
    };
    setLocalGroups([...localGroups, newGroup]);
  };

  const removeGroup = (groupIndex) => {
    if (localGroups.length <= 1) return;
    const updated = [...localGroups];
    updated.splice(groupIndex, 1);
    setLocalGroups(updated);
  };

  const addInputToGroup = (groupIndex) => {
    const updated = [...localGroups];
    updated[groupIndex].fields.push('');
    setLocalGroups(updated);
  };

  const removeInputFromGroup = (groupIndex, fieldIndex) => {
    const updated = [...localGroups];
    if (updated[groupIndex].fields.length <= 2) return;
    updated[groupIndex].fields.splice(fieldIndex, 1);
    setLocalGroups(updated);
  };

  const updateField = (groupIndex, fieldIndex, value) => {
    const updated = [...localGroups];
    updated[groupIndex].fields[fieldIndex] = value;
    setLocalGroups(updated);
  };

  const updateColor = (groupIndex, color) => {
    const updated = [...localGroups];
    updated[groupIndex].color = color;
    setLocalGroups(updated);
  };

  const toggleGroupEnabled = (groupIndex, checked) => {
    const updated = [...localGroups];
    updated[groupIndex].enabled = checked;
    setLocalGroups(updated);
  };

  const setAllEnabled = (value) => {
    const updated = localGroups.map((g) => ({ ...g, enabled: value }));
    setLocalGroups(updated);
  };

  const handleConfirm = () => {
    onGroupsChange(localGroups);
    onClose();
  };

  return (
    <Drawer title="角色群組設定" open={open} onClose={onClose} width={420} zIndex={1600}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="default" onClick={() => setAllEnabled(true)}>
          全部啟用
        </Button>
        <Button type="default" onClick={() => setAllEnabled(false)}>
          全部停用
        </Button>
        <Button type="dashed" onClick={addGroup} icon={<PlusOutlined />}>
          新增群組
        </Button>
      </Space>

      <Divider />

      {localGroups.map((group, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            background: colorBgContainer,
            border: `1px solid ${colorBorderSecondary}`,
            padding: 16,
            marginBottom: 20,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            opacity: group.enabled ? 1 : 0.6,
            transition: 'opacity 0.2s',
          }}
        >
          {localGroups.length > 1 && (
            <Button
              type="text"
              danger
              icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
              onClick={() => removeGroup(i)}
              aria-label="刪除群組"
              style={{ position: 'absolute', top: 8, right: 8 }}
            />
          )}

          <Checkbox
            checked={group.enabled}
            onChange={(e) => toggleGroupEnabled(i, e.target.checked)}
            style={{ marginBottom: 12, fontWeight: 500 }}
          >
            啟用角色群組 {i + 1}
          </Checkbox>

          <Space direction="vertical" style={{ width: '100%' }}>
            {group.fields.map((val, j) => (
              <Space key={j} style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  value={val}
                  onChange={(e) => updateField(i, j, e.target.value)}
                  placeholder={`角色欄位 ${j + 1}`}
                  disabled={!group.enabled}
                  style={{ flex: 1 }}
                />
                {(group.fields.length > 2) && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeInputFromGroup(i, j)}
                    disabled={!group.enabled}
                    aria-label="刪除角色欄位"
                  />
                )}
              </Space>
            ))}

            <Button
              onClick={() => addInputToGroup(i)}
              block
              disabled={!group.enabled}
              type="dashed"
              icon={<PlusOutlined />}
              style={{ marginTop: 8 }}
            >
              新增角色欄位
            </Button>

            <Space style={{ marginTop: 12 }}>
              <Select
                value={group.color}
                onChange={(val) => updateColor(i, val)}
                style={{ width: 120 }}
                disabled={!group.enabled}
              >
                {DEFAULT_COLORS.map((color) => (
                  <Select.Option key={color} value={color}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: color,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          marginRight: 6,
                        }}
                      />
                      {color}
                    </div>
                  </Select.Option>
                ))}
              </Select>

              <input
                type="color"
                value={group.color}
                onChange={(e) => updateColor(i, e.target.value)}
                disabled={!group.enabled}
                style={{ border: 'none', background: 'transparent', cursor: group.enabled ? 'pointer' : 'not-allowed' }}
              />
            </Space>
          </Space>
        </div>
      ))}

      <Button type="primary" onClick={handleConfirm} block style={{ marginTop: 24 }}>
        確認，生成關係圖
      </Button>
    </Drawer>
  );
};

export default SideDrawer;
