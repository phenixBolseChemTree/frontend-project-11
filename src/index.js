import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import translations from './localization/i18resours.js';
import app from './formController.js';

const changeLanguage = () => {
  document.querySelector('.lng-h1').innerHTML = i18next.t('h1');
  document.querySelector('.lng-p').innerHTML = i18next.t('p');
  document.querySelector('.lng-label').innerHTML = i18next.t('label');
  document.querySelector('.lng-button').innerHTML = i18next.t('button');
  document.querySelector('.lng-link').innerHTML = i18next.t('link');
  document.querySelector('.lng-posts').innerHTML = i18next.t('posts');
  document.querySelector('.lng-feeds').innerHTML = i18next.t('feeds');
};

const hash = window.location.hash.slice(1);

i18next.init({
  lng: 'ru',
  resources: translations,
});

app(); // вся логика формы

changeLanguage(); // перевод текста на стринице
