import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import translations from './localization/i18resours.js';
import app from './formController.js';
import changeLanguagePage from './changeLanguage.js';
import selectLang from './selectLang.js';

const hash = window.location.hash.slice(1);

i18next.init({
  lng: hash,
  resources: translations,
});

app(); // вся логика формы

selectLang(); // обработчик изменения языка

const refreshToEn = () => {
  const selectLang = document.querySelector('#languageSelect');
  const allLang = ['ru', 'en'];
  const hash = window.location.hash.slice(1);
  if (!allLang.includes(hash)) {
    location.href = `${window.location.pathname}#en`;
    location.reload();
  }
  selectLang.value = hash;
};
refreshToEn();

changeLanguagePage(); // перевод текста на стринице
