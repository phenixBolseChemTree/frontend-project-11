import i18next from 'i18next';

const changeLanguage = () => {
  document.querySelector('.lng-h1').innerHTML = i18next.t('h1');
  document.querySelector('.lng-p').innerHTML = i18next.t('p');
  document.querySelector('.lng-label').innerHTML = i18next.t('label');
  document.querySelector('.lng-button').innerHTML = i18next.t('button');
  document.querySelector('.lng-link').innerHTML = i18next.t('link');
};

export default changeLanguage;
