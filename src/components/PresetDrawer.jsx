import React, { useEffect, useState } from 'react';
import { Drawer, Button, List } from 'antd';
import { useTranslation } from 'react-i18next';

const PresetDrawer = ({ open, onClose, onLoadPreset }) => {
  const { t, i18n } = useTranslation(['common']);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadPresetArticles = async () => {
      const fileList = ['紅樓夢_前八十回.json', '紅樓夢_後八十回.json', '下一站幸福.json']; // 改成你所有 json
      const loaded = await Promise.all(
        fileList.map(async (file) => {
          const url = `${import.meta.env.BASE_URL}presetData/${encodeURIComponent(file)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to load ${url}`);
          const json = await res.json();
          return { ...json, file };
        })
      );      
      
      setArticles(loaded);
    };

    if (open) {
      loadPresetArticles();
    }
  }, [open]);

  return (
    <Drawer
      title={t('common:預收錄文章')}
      placement="left"
      onClose={onClose}
      open={open}
      width={300}
      zIndex={1600}
    >
      <List
        dataSource={articles}
        renderItem={(item) => (
          <List.Item>
            <Button 
              type="link" 
              onClick={() => {
                onLoadPreset({
                  content: item.content,
                  groups: item.keywords, // 傳入 keywords 作為 groups (二維陣列)
                  title: item.title,
                });
                onClose();
              }}
            >
              {item.title}
            </Button>
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default PresetDrawer;
