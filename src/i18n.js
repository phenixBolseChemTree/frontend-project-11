import i18next from 'i18next';
// import yup from 'yup';
import translations from './locales/ru.js';

console.log(translations);

export default () => {
  i18next.init({
    lng: 'ru',
    resources: translations,
  });
};
