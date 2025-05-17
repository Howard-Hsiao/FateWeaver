import { Select, Space, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const handleChange = (value) => {
    i18n.changeLanguage(value);
    setLang(value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <GlobalOutlined style={{ fontSize: 16, color: '#888' }} />
      <Select
        value={i18n.language}
        onChange={handleChange}
        style={{ width: 100 }}
        options={[
          { label: '中文', value: 'zh' },
          { label: 'English', value: 'en' },
        ]}
      />
    </div>
  );
};

export default LanguageSwitcher;
