import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';
import { renderFeed, renderPosts } from './renderModule/renderContents.js';

const formController = () => {
  const initialStoreValues = {
    feed: [],
    posts: [],
    links: [],
  };

  const store = onChange(initialStoreValues, (path, value) => {
    if (path === 'feed') {
      // console.log('!!!Feed', value);
      const lastFeed = value[value.length - 1];
      renderFeed(lastFeed); // отображает новый фид на странице
      // создать обработчик для добавления данных
    }
    if (path === 'posts') {
      // console.log('!!!Posts', value);
      // console.log('!!!PreValue', preValue);
      // console.log('!!!Store', store);
      const lastPosts = value[value.length - 1];
      // console.log('lastPosts:', lastPosts);
      renderPosts(lastPosts); // отображает посты на странице
    }
    });

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const queryValue = formData.get('query'); // ссылка
    console.log('!!!queryValue', queryValue);
    if (queryValue) {
      rssSchema.validate(queryValue)
        .then((resolve) => {
          if (!store.links.includes(resolve)) {
            input.classList.remove('is-invalid');
            render(store, resolve);
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
