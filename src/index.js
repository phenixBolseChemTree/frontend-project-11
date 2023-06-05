import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import render from './render.js';
import langObj from './lang.js';

const rssLinks = [];
const rssSchema = yup.string().url().required().matches(/\.rss$/);
const form = document.querySelector('form');
const input = form.querySelector('#query');
const isSubmit = false; // нужен для отслеживания если input имеет класс is-invalid

input.addEventListener('input', (event) => {
  rssSchema.validate(event.target.value)
    .then(() => {
      input.classList.remove('is-invalid');
    })
    .catch(() => {
      if (isSubmit) {
        input.classList.add('is-invalid');
      }
    });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  formData.forEach((value, name) => {
    if (name === 'query') {
      rssSchema.validate(value)
        .then((resolve) => {
          if (!rssLinks.includes(resolve)) {
            input.classList.remove('is-invalid');
            rssLinks.push(resolve);
            render(resolve);
            console.log(rssLinks);
            event.target.reset();
            input.focus();
          } else {
            console.log(rssLinks);
            input.classList.add('is-invalid');
          }
        })
        .catch(() => {
          console.log('идет плохой сценарий');
          input.classList.add('is-invalid');
        });
    }
  });
});

const feedbackElement = document.querySelector('p.feedback');
feedbackElement.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('https://ru.hexlet.io/lessons.rss');
    alert('Copy https://ru.hexlet.io/lessons.rss');
  } catch (error) {
    console.error('Ошибка при копировании в буфер обмена:', error);
  }
});

// -------

const allLang = ['ru', 'en'];

const selectLang = document.querySelector('#languageSelect');

selectLang.addEventListener('change', () => {
  const lang = selectLang.value;
  location.replace(`${window.location.pathname}#${lang}`);
  selectLang.value = lang;
  console.log(lang);
  location.reload();
});

// ---------

function changeLanguage() {
  let { hash } = window.location;
  hash = hash.substring(1);
  console.log(hash);
  if (!allLang.includes(hash)) {
    location.href = `${window.location.pathname}#en`;
    location.reload();
  }
  selectLang.value = hash;
  document.querySelector('.lng-h1').innerHTML = langObj.h1[hash];
  document.querySelector('.lng-p').innerHTML = langObj.p[hash];
  document.querySelector('.lng-label').innerHTML = langObj.label[hash];
  document.querySelector('.lng-button').innerHTML = langObj.button[hash];
  document.querySelector('.lng-link').innerHTML = langObj.link[hash];
}

changeLanguage();
