import i18next from 'i18next';
import translations from './localization/i18resours.js';

export default () => {
  i18next.init({
    lng: 'ru',
    resources: translations,
  });
};
