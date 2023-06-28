import i18next from 'i18next';
// import yup from 'yup';
import translations from './locales/ru.js';

export default () => {
  i18next.init({
    lng: 'ru',
    resources: translations,
  });
};

// const existingUrls = [];

// const i18nextInstance = i18next.createInstance();

// i18nextInstance
//   .init({
//     lng: 'ru',
//     debug: false,
//     resources,
//   })
//   .then(() => {
//     yup.setLocale({
//       mixed: {
//         notOneOf: 'translation.duplicateRSSlink',
//       },
//       string: {
//         required: 'translation.doesentEmpty',
//         url: 'translation.InvalidRSSlink',
//       },
//     });
//   });
