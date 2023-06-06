import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';

const formController = () => {
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

  // Создаем прокси для отслеживания изменений в массиве rssLinks
  const watchedRssLinks = onChange(rssLinks, (path, value, previousValue) => {
    if (path.includes('length')) {
      // Обрабатываем изменения длины массива rssLinks (push, pop, splice и т.д.)
      return;
    }
    // Обрабатываем другие изменения в массиве rssLinks
    console.log('rssLinks изменился:');
    console.log('path:', path); // Измененный путь
    console.log('value:', value); // Новое значение
    console.log('previousValue:', previousValue); // Предыдущее значение
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    formData.forEach((value, name) => {
      if (name === 'query') {
        rssSchema.validate(value)
          .then((resolve) => {
            if (!watchedRssLinks.includes(resolve)) {
              input.classList.remove('is-invalid');
              watchedRssLinks.push(resolve);
              render(resolve);
              console.log(i18next.t('successfulScenario')); // Успешный сценарий
              event.target.reset();
              input.focus();
            } else {
              console.log(i18next.t('duplicateRSSlink')); // Повторяющаяся ссылка RSS
              input.classList.add('is-invalid');
            }
          })
          .catch(() => {
            console.log(i18next.t('InvalidRSSlink')); // Некорректная ссылка RSS
            input.classList.add('is-invalid');
          });
      }
    });
  });
};

export default formController;
