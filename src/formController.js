import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';
// import { renderFeed, renderPosts } from './renderModule/renderContents.js';
import { renderFeed, renderPosts } from './view.js';

const formController = () => {
  const initialStoreValues = {
    feed: [],
    posts: [],
    links: [],
    openPosts: [],
    initContainer: false,
  };

  let iter = 1;

  const store = onChange(initialStoreValues, (path, value) => {
    if (path === 'feed') {
      const lastFeed = value[value.length - 1];
      renderFeed(lastFeed);
    }
    if (path === 'posts') {
      console.log('пришли вот эти данные (posts) !!!!', value);
      console.log(iter);
      iter += 1;
      renderPosts(store); // отображает посты на странице

      // нужно брать последние добавленные массивы во всех store

      // const autoUpdator = (value, preventDefault) => {
      //   const link = store.links[store.links.length - 1]; // последний массив
      //   const posts = store.posts[store.posts.length - 1];
      //   // lastData = (posts[posts.length - 1]).pubDate;
      //   fetchDataAuto()
      // }
      // console.log('!!!value', value);
      // value.forEach((elem) => {
      // const newID =
      // descriptionData[id] = elem.description
      // });
    }
    });

  const rssSchema = yup.string().url().required();
  const form = document.querySelector('form');
  const input = form.querySelector('#query');
  const isSubmit = false; // нужен для отслеживания если input имеет класс is-invalid
  const feedback = document.querySelector('.lng-feedback');
  const submitButton = document.querySelector('.lng-button');

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
    submitButton.disabled = true;
    const formData = new FormData(form);
    const queryValue = formData.get('query');
    if (queryValue) {
      rssSchema.validate(queryValue)
        .then((resolve) => {
          if (!store.links.includes(resolve)) {
            input.classList.remove('is-invalid');
            render(store, resolve);
            // event.target.reset();
            input.focus();
          } else {
            feedback.textContent = i18next.t('duplicateRSSlink');
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            input.classList.add('is-invalid');
            submitButton.disabled = false;
          }
        })
        .catch((e) => {
          console.log('my error', e);
          feedback.textContent = i18next.t('InvalidRSSlink');
          feedback.classList.remove('text-success');
          feedback.classList.add('text-danger');
          input.classList.add('is-invalid');
        });
    }
  });
};

export default formController;
