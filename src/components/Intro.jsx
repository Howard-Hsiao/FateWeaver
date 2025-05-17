import React from 'react';
import { Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph, Text } = Typography;

const Intro = () => {
  const { t } = useTranslation(["intro"]);

  return (
    <div style={{padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h2>{t('intro.title')}</h2>
      <p>
        <strong>Fate Weaver</strong> {t('intro.description')}
      </p>
      <h3>🌀 {t('intro.inspirationTitle')}</h3>
      <p>{t('intro.inspiration1')}</p>
      <p>{t('intro.inspiration2')}</p>
      <h3>🛠 {t('intro.featuresTitle')}</h3>
      <ul>
        <li>{t('intro.feature1')}</li>
        <li>{t('intro.feature2')}</li>
        <li>{t('intro.feature3')}</li>
        <li>{t('intro.feature4')}</li>
        <li>{t('intro.feature5')}</li>
      </ul>
      <h3>📚 {t('intro.targetTitle')}</h3>
      <ul>
        <li>{t('intro.target1')}</li>
        <li>{t('intro.target2')}</li>
        <li>{t('intro.target3')}</li>
      </ul>
      <h3>📎 {t('intro.noteTitle')}</h3>
      <p>{t('intro.note')}</p>
    </div>
  );
};

export default Intro;
