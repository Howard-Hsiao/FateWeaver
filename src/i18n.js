import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // 加上這行才能從 public 讀 json
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'zh-TW'],
    fallbackLng: "en",
    lng: "zh-TW", // 預設語言
    ns: ["common", "intro"],       // namespace（模組）名稱
    defaultNS: "common",
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
