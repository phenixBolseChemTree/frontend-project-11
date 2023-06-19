import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';

const formController = () => {
  const rssLinks = [];
  const rssSchema = yup.string().url().required();
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

  const watchedRssLinks = onChange(rssLinks, (path, value) => {
    if (path.includes('length')) {
      return;
    }
    if (path === 'rssLinks') {
      console.log('wwww333');
    }
    console.log('новый rss', value);
    render(value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const queryValue = formData.get('query'); // ссылка
    if (queryValue) {
      rssSchema.validate(queryValue)
        .then((resolve) => {
          console.log('resolve :', resolve);
          if (!watchedRssLinks.includes(resolve)) {
            input.classList.remove('is-invalid');
            watchedRssLinks.push(resolve);
            console.log('!!!link :', resolve);
            console.log(i18next.t('successfulScenario')); // Успешный сценарий
            event.target.reset();
            input.focus();
          } else {
            console.log(i18next.t('duplicateRSSlink')); // Повторяющаяся ссылка RSS
            input.classList.add('is-invalid');
          }
        })
        .catch((e) => {
          console.log('my error', e);
          console.log(i18next.t('InvalidRSSlink')); // Некорректная ссылка RSS
          input.classList.add('is-invalid');
        });
    }
  });
};

export default formController;
