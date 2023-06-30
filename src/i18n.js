import i18next from 'i18next';
import translations from './locales/ru.js';

export default () => {
  i18next.init({
    lng: 'ru',
    resources: translations,
  });
};
