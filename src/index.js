import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import render from './render.js';
import makeCopyElement from './makeCopyElement.js';
import translations from '../../localization/i18resours.js';
import formController from './formController.js';
import refreshToEn from './refreshToEn.js';
import changeLanguagePage from './changeLanguage.js';
import selectLang from './selectLang.js';

const rssLinks = [];
const rssSchema = yup.string().url().required().matches(/\.rss$/);
const form = document.querySelector('form');
const input = form.querySelector('#query');
const isSubmit = false; // нужен для отслеживания если input имеет класс is-invalid
const hash = window.location.hash.slice(1);

i18next.init({
  lng: hash,
  resources: translations,
});

formController(rssLinks, rssSchema, form, input, isSubmit, render); // вся логика формы

makeCopyElement(); // копируемый при клике элемент

selectLang(); // обработчик изменения языка

refreshToEn(); // управление блоком контролирующим языки

changeLanguagePage(); // перевод текста на стринице
