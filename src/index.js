import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import translations from './localization/i18resours.js';
import app from './formController.js';

i18next.init({
  lng: 'ru',
  resources: translations,
});

app(); // вся логика формы
