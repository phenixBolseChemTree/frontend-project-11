import './styles.scss';
import 'bootstrap';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import i18nInit from './i18n';
import fetchRSS from './fetchRSS';
import { renderFeed, renderPosts, renderContainer } from './render';

const parser = (response) => {
  const domParser = new DOMParser();
  return domParser.parseFromString(response.data.contents, 'application/xml');
};

const pickOnlyNewPosts = (posts, lastDateNumber) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > lastDateNumber) {
      return true;
    }
    return false;
  });
  return newPosts;
};

i18nInit();

// const app = () => {
const initialStoreValues = {
  feed: [],
  posts: [],
  visitedPosts: [],
  form: {
    isFormSubmitted: false,
    submittionError: null,
    validationError: null,
    isLoading: false,
  },
};

const store = onChange(initialStoreValues, (path, value) => {
  if (path === 'feed') {
    renderFeed(value[value.length - 1]);
  }
  if (path === 'posts') {
    renderPosts(store);
  }

  if (path === 'form') {
    const queryElement = document.querySelector('#query');

    const isError = value.submittionError || value.validationError;

    if (path.isFormSubmitted && isError) {
      queryElement.classList.add('is-invalid');
    } else {
      queryElement.classList.remove('is-invalid');
    }

    // принимает слово об результате кода и выводит его
    const formResultEl = document.querySelector('#form-result');

    const showError = (text) => {
      formResultEl.classList.add('text-danger');
      formResultEl.classList.remove('text-success');
      formResultEl.textContent = i18next.t(text);
    };

    // Success
    if (value.isFormSubmitted && !isError) {
      formResultEl.classList.remove('text-danger');
      formResultEl.classList.add('text-success');
      formResultEl.textContent = i18next.t('successfulScenario');
    }

    // Dublicate
    if (value.isFormSubmitted && value.validationError === 'DUBLICATE_ERROR') {
      showError('duplicateRSSlink');
    }

    // Not valid RSS
    if (value.isFormSubmitted && value.submittionError === 'UNVALID_SSR') {
      showError('doesentVolidRSS');
    }

    // Validation error
    if (value.isFormSubmitted && value.validationError === 'VALIDATION_ERROR') {
      showError('InvalidRSSlink');
    }
  }

  // ВРЕМЕННО, КАК ЗАКОНЧУ УДАЛИТЬ

  const debugEl = document.querySelector('#debug');

  if (debugEl) {
    debugEl.innerHTML = JSON.stringify(store);
  }
});

const parseData = (data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
  title: nodeItem.querySelector('title').innerHTML,
  description: nodeItem.querySelector('description').innerHTML,
  link: nodeItem.querySelector('link').innerHTML,
  pubDate: nodeItem.querySelector('pubDate').innerHTML,
}));

const fetchRSSAuto = (link, lastDataArg) => {
  let lastDateNumber = null;
  let newPosts = [];
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => {
      if (response.status === 200) {
        const domXML = parser(response);
        return domXML;
      }
    })
    .then((data) => parseData(data))
    .then((data) => { // массив всех постов из API
      if (data.length !== 0) { // посты есть
        newPosts = (pickOnlyNewPosts(data, lastDataArg)).reverse();
        if (newPosts.length !== 0) { // есть новые данные
          store.posts.push(...newPosts); // вот наша магия !!!!
          const currentlastData = (data[0]).pubDate; // данные есть новая дата
          lastDateNumber = Date.parse(currentlastData);
        } else {
          lastDateNumber = lastDataArg;
        }
      } else {
        lastDateNumber = lastDataArg;
      }
    })
    .catch(() => {
      store.form = {
        ...store.form,
        submittionError: 'UNVALID_SSR',
      };
    })
    .finally(() => {
      setTimeout(() => fetchRSSAuto(store, link, lastDateNumber), 5000); // id === indexArr
    });
};

const rssSchema = yup.string().url().required();
const formElement = document.querySelector('form');
const queryElement = formElement.querySelector('#query');

const validateQuery = (text) => {
  if (store.feed.map(({ link }) => link).includes(text)) {
    store.form = {
      ...store.form,
      validationError: 'DUBLICATE_ERROR',
    };

    return new Promise(() => { });
  }

  return rssSchema.validate(text)
    .then((link) => {
      store.form = {
        ...store.form,
        validationError: null,
      };

      return link;
    })
    .catch(() => {
      store.form = {
        ...store.form,
        validationError: 'VALIDATION_ERROR',
      };
    });
};

queryElement.addEventListener('input', () => {
  // validateQuery(event.target.value);
});

formElement.addEventListener('submit', (event) => {
  event.preventDefault();

  const query = event.target[0].value;

  store.form = {
    ...store.form,
    isLoading: true,
    isFormSubmitted: true,
  };

  validateQuery(query)
    .then((link) => {
      if (!link) {
        return;
      }

      if (!store.feed.length) {
        renderContainer();
        store.initContainer = true;
      }

      fetchRSS(link)
        .then((data) => {
          const error = data?.data?.status?.error?.code;
          if (error) {
            store.form = {
              ...store.form,
              submittionError: error,
            };
            return;
          }

          if (data.data.status.http_code === 200) {
            const domXML = parser(data);
            const title = domXML.querySelector('title').textContent;
            const description = domXML.querySelector('description').textContent;
            store.feed.push({ title, description, link });

            const posts = parseData(domXML);

            store.posts.push(...posts.reverse());

            const lastData = (posts[posts.length - 1]).pubDate;
            const lastDateNumber = Date.parse(lastData);
            setTimeout(() => fetchRSSAuto(store, link, lastDateNumber), 5000);
          }
        })
        .finally(() => {
          store.form = {
            ...store.form,
            isFormSubmitted: true,
            isLoading: false,
          };
        });
    });
});
