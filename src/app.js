import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parse from './parse';
import render from './view';
import translations from './locales/ru';

const fetchProxyRSS = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('url', link);
  url.searchParams.append('disableCache', 'true');

  return axios.get(url.toString());
};

const getId = (() => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
})();

const autoAddNewPosts = (_store) => {
  const linksFromFeeds = _store.feeds.map((feed) => feed.link);
  const getNewPosts = (newPosts, posts) => {
    const existingLinks = posts.map((post) => post.link);
    const filteredPosts = newPosts.filter((post) => !existingLinks.includes(post.link));
    return filteredPosts;
  };

  const promises = linksFromFeeds.map((link) => fetchProxyRSS(link)
    .then((response) => {
      const data = JSON.stringify(response);
      const parsedData = parse(data);
      const { posts } = parsedData;

      if (posts.length !== 0) {
        const newPosts = getNewPosts(posts.reverse(), _store.posts);

        if (newPosts.length !== 0) {
          const postsWithId = newPosts.map((post) => ({ ...post, id: getId() }));
          _store.posts.push(...postsWithId);
        }
      }
    })
    .catch((e) => {
      console.log('invalidRSS', e);
    }));

  Promise.all(promises)
    .then(() => {
      setTimeout(() => autoAddNewPosts(_store), 5000);
    });
};

const elements = {
  form: document.querySelector('.text-body'),
  query: document.querySelector('#query'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: document.querySelector('#modal'),
  button: document.querySelector('.btn-primary'),
};

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    resources: translations,
  }).then(() => {
    const initialStoreModel = {
      feeds: [],
      posts: [],
      status: 'idle',
      visitedPosts: [],
      feedback: null,
      modalId: '',
    };
    const store = onChange(initialStoreModel, (path) => {
      render(store, i18nextInstance, path, elements);
    });

    const validate = (url, urls) => {
      const schema = yup.string().url('InvalidRSSlink').notOneOf(urls, 'duplicateRSSlink').required('emptyInput');
      return schema.validate(url, { abortEarly: false });
    };

    const containerListEl = elements.posts;
    containerListEl.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (id) {
        store.modalId = id;
        console.log('array', Array.from(store.visitedPosts));
        console.log('origin', store.visitedPosts);
        if (!Array.from(store.visitedPosts).includes(id)) {
          store.visitedPosts.push(id);
        }
      }
    });

    autoAddNewPosts(store);

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.status = 'loading';
      const link = elements.query.value;
      const links = store.feeds
        .map((feed) => feed.link);

      validate(link, links)
        .then((url) => fetchProxyRSS(url))
        .then((response) => {
          const data = JSON.stringify(response);
          const parsedData = parse(data);
          const { title, description, posts } = parsedData;
          const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId() }));
          store.feedback = 'successfulScenario';
          const postsWithId = postsIdRev;
          store.feeds.push({ title, description, link });
          store.posts.push(...postsWithId);
          store.status = 'success';

          store.status = 'filling';
        })
        .catch((error) => {
          if (error.message === 'Network Error') {
            store.feedback = 'networkError';
            store.status = 'failed';
          } else {
            store.feedback = error.message;
            store.status = 'failed';
          }
          if (store.feeds.length === 0) {
            store.status = 'idle';
          } else {
            store.status = 'filling';
          }
        });
    });
  });
};

export default app;
