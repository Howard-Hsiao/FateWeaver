import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Typography,
  Input,
  Switch,
  ConfigProvider,
  theme,
  Space,
  Button,
  Card,
  theme as antdTheme
} from 'antd';
import SideDrawer from './components/SideDrawer'; // 請自行準備符合你需求的 Drawer Component
import PresetDrawer from './components/PresetDrawer';
import appIcon from './assets/connect-svgrepo-com.svg';
import { DEFAULT_COLORS } from './configs/constants';
import { ClearOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';   // ← 新增
import './i18n'; // 確保 i18n 被 import 來初始化
import LanguageSwitcher from './components/LanguageSwitcher';
import Intro from './components/Intro';

const iconCircleStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const floatingRightButtonStyle = {
  position: 'fixed',
  top: '50%',
  right: 0,
  transform: 'translateY(-50%)',
  height: '60px',
  padding: 0,
  borderTopLeftRadius: '30px',
  borderBottomLeftRadius: '30px',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
  cursor: 'pointer',
};


const floatingLeftButtonStyle = {
  position: 'fixed',
  top: '50%',
  left: 0,
  transform: 'translateY(-50%)',
  height: '60px',
  padding: 0,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderTopRightRadius: '30px',
  borderBottomRightRadius: '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
  cursor: 'pointer',
};


const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text, Link } = Typography;
const { TextArea } = Input;

function App() {
  const { t } = useTranslation(['common']);   // ← 新增

  const [isDark, setIsDark] = useState(false);
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presetDrawerOpen, setPresetDrawerOpen] = useState(false);


  const DEFAULT_GROUPTS = [
    { fields: ['', ''], color: '#F44336', enabled: true },
  ]

  const [groups, setGroups] = useState(DEFAULT_GROUPTS);

  // 儲存每個高亮按鈕的 ref 與位置資訊
  const buttonRefs = useRef({});
  const [positions, setPositions] = useState({}); // { key: {x,y} }
  const containerRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const referenceRef = useRef(null);
  const { token } = antdTheme.useToken();
  const textColor = isDark ? token.colorText : '#000';
  const scrollToReference = () => {
    if (referenceRef.current) {
      referenceRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const newPositions = {};
    const container = containerRef.current;

    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    Object.entries(buttonRefs.current).forEach(([key, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();

        newPositions[key] = {
          x: rect.left - containerRect.left + scrollLeft + rect.width / 2,
          y: rect.top - containerRect.top + scrollTop + rect.height / 2,
        };
      }
    });

    setPositions(newPositions);

    if (container) {
      const { scrollWidth, scrollHeight } = container;
      setSvgSize({
        width: scrollWidth,
        height: scrollHeight,
      });
    }
  }, [savedText, groups]);

  // 計算所有線條（不同field間同group的按鈕連線）
  const lines = [];
  groups.forEach((group, gi) => {
    if (!group.enabled) return;
    const { fields, color } = group;
    if (fields.length < 2) return;
    // 取出所有該group各field的所有按鈕 key
    const fieldKeys = {};
    fields.forEach((field) => {
      fieldKeys[field] = Object.keys(buttonRefs.current).filter((k) =>
        k.startsWith(`${field}::`)
      );
    });

    // 不連同 field 內的按鈕，只連不同 field 之間所有按鈕
    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        const f1Keys = fieldKeys[fields[i]];
        const f2Keys = fieldKeys[fields[j]];
        f1Keys.forEach((k1) => {
          f2Keys.forEach((k2) => {
            if (positions[k1] && positions[k2]) {
              lines.push({
                x1: positions[k1].x,
                y1: positions[k1].y,
                x2: positions[k2].x,
                y2: positions[k2].y,
                color,
                key: `${k1}-${k2}`,
                opacity: 0.1
              });
            }
          });
        });
      }
    }
  });

  // 將 savedText 分割並替換為按鈕元件
  const highlightedElements = React.useMemo(() => {
    if (!savedText) return null;

    // 先找出所有 enabled 的 groups 的 fields，並按長度排序，避免短字串被長字串拆解
    const enabledGroups = groups.filter(g => g.enabled);
    const allFields = enabledGroups.flatMap((g) => g.fields).filter(f => f);
    const sortedFields = [...new Set(allFields)].sort((a, b) => b.length - a.length);


    const elements = [];
    let cursor = 0;
    const textLen = savedText.length;

    while (cursor < textLen) {
      let matched = false;
      for (const field of sortedFields) {
        if (
          savedText.startsWith(field, cursor)
        ) {
          // 找出對應 group 的顏色
          const group = enabledGroups.find((g) => g.fields.includes(field));
          const color = group ? group.color : '#000';

          const key = `${field}::${cursor}`;

          elements.push(
            <Button
              size="small"
              key={key}
              ref={(el) => (buttonRefs.current[key] = el)}
              style={{
                margin: '0 4px 4px 0',
                padding: '0 8px',
                backgroundColor: color,
                border: 'none',
                cursor: 'default',
                userSelect: 'none',
                color: '#fff',
                fontWeight: 'bold',
                pointerEvents: 'auto',
              }}
              disabled
            >
              {field}
            </Button>
          );
          cursor += field.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        // 非field文字當純文字輸出
        elements.push(savedText[cursor]);
        cursor++;
      }
    }

    return elements;
  }, [savedText, groups]);

  const handleConfirm = () => {
    if (text.trim()) {
      setSavedText(text.trim());
      setText('common:');
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setText(savedText);
    setIsEditing(true);
  };

  const handleGroupChange = (newGroups) => {
    setGroups(newGroups);
  };

  const convertKeywordsToGroups = (keywords) => {
    return keywords.map((fields, i) => ({
      fields,
      enabled: false,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));
  };

  const handleLoadPreset = (preset) => {
    console.log('Loading preset:', convertKeywordsToGroups(preset.groups));
    setGroups(convertKeywordsToGroups(preset.groups));

    setText(preset.content);
    handleConfirm();
    setPresetDrawerOpen(false);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ width: '100vw', minHeight: '100vh' }}>
        <Header
          style={{
            background: 'transparent',
            paddingInline: 24,
            paddingBlock: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              rowGap: 12,
            }}
          >
            {/* 左邊：LOGO + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconCircleStyle}>
                <img src={appIcon} alt="icon" style={{ width: 30, height: 30 }} />
              </div>
              <Title level={3} style={{ margin: 0, color: isDark ? '#fff' : '#000' }}>
                {t('common:因緣線')}
              </Title>
            </div>

            {/* 右邊：語言 + 暗黑模式 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              <LanguageSwitcher />
              <span style={{ color: isDark ? '#aaa' : '#555' }}>{t('common:暗黑模式')}</span>
              <Switch checked={isDark} onChange={setIsDark} />
            </div>
          </div>
        </Header>

        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '48px 16px',
            position: 'relative',
          }}
        >
          <div style={{ height: '75vh', maxWidth: 800, width: '100%', position: 'relative' }}>
            {isEditing ? (
              <>
                <Title level={4}>{t('common:請寫下你的故事')}</Title>
                <TextArea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoSize={{ minRows: 8, maxRows: 20 }}
                  placeholder={t('common:你的故事，你說我聽...')}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                />
                <Button type="primary" onClick={handleConfirm}>
                  {t('common:確認')}
                </Button>
              </>
            ) : (
              <div style={{ position: 'relative' }} ref={containerRef}>
                <Title level={4}>{t('common:因緣線結果：')}</Title>
                <Paragraph
                  style={{
                    backgroundColor: isDark ? '#1f1f1f' : '#f5f5f5',
                    padding: 16,
                    borderRadius: 8,
                    minHeight: 160,
                    userSelect: 'none',
                    position: 'relative',
                    zIndex: 1,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {highlightedElements}
                </Paragraph>
                <Button onClick={handleEdit}>{t('common:編輯')}</Button>

                {/* SVG 畫布用來畫線 */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    width: svgSize.width,
                    height: svgSize.height,
                    zIndex: 1500,
                  }}
                >
                  {lines.map(({ x1, y1, x2, y2, color, key }) => (
                    <line
                      key={key}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.7}
                    />
                  ))}
                </svg>
              </div>
            )}

            {!presetDrawerOpen && (
              <Button
                type="primary"
                style={floatingLeftButtonStyle}
                onClick={() => setPresetDrawerOpen(true)}
              >
                {t('common:載入預收錄文章')}
              </Button>
            )}


            {!drawerOpen && (
              <Button
                type="primary"
                style={floatingRightButtonStyle}
                onClick={() => setDrawerOpen(true)}
              >
                {t('common:設定關聯角色')}
              </Button>
            )}

            <SideDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              groups={groups}
              onGroupsChange={handleGroupChange}
            />
            <PresetDrawer
              open={presetDrawerOpen}
              onClose={() => setPresetDrawerOpen(false)}
              onLoadPreset={handleLoadPreset}
            />

            <div style={{ position: 'relative', minHeight: '25vh' }}>
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<ClearOutlined style={{ fontSize: 24 }} />}
                onClick={() => {
                  setGroups(DEFAULT_GROUPTS);
                  setSavedText(t('common:等待故事'));
                  handleConfirm(t('common:等待故事'));
                }}
                style={{
                  position: 'fixed',
                  right: 24,
                  bottom: 24,
                  zIndex: 2000,
                  width: 48,
                  height: 48,
                  padding: 0,
                }}
              />
            </div>
          </div>
        </Content>

        {/* 參考來源區塊 */}
        <div style={{ color: isDark ? '#f0f0f0' : '#141414', padding: 24, maxWidth: 720, margin: '0 auto' }}>
          <Intro />
        </div>

        <div
          ref={referenceRef}
          style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: isDark ? '#141414' : '#f5f5f5',
            color: isDark ? '#f0f0f0' : '#141414',
            padding: '64px 24px',
            borderRadius: 12,
            marginTop: 64,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.5)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            border: isDark ? '1px solid #303030' : '1px solid #e0e0e0',
          }}
        >
          <Card
            style={{
              maxWidth: 600,
              width: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              borderRadius: 12,
            }}
          >
            <Title level={3} style={{ textAlign: 'center' }}>
              {t('common:參考來源')}
            </Title>
            <Paragraph style={{ textAlign: 'center' }}>
              {t('common:參考內文')}
            </Paragraph>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <iframe
                src="https://www.behance.net/embed/project/12000833?ilo0=1"
                height="316"
                width="404"
                allowFullScreen
                loading="lazy"
                allow="clipboard-write"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Reference"
                style={{ borderRadius: 8 }}
              ></iframe>
            </div>
            <Paragraph style={{ marginTop: 24, textAlign: 'center', color: textColor }}>
              <Text type="secondary">{t('common:靈感來源於：')}</Text>{' '}
              <Link
                href="https://www.behance.net/gallery/12000833/UI-UX-Design"
                target="_blank"
                rel="noopener noreferrer"
              >
                Behance
              </Link>
            </Paragraph>
          </Card>
        </div>

        <Footer style={{ textAlign: 'center', color: isDark ? '#888' : '#aaa' }}>
          ©2025 YunJoy
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
