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
      const parsedData = parse(response.data.contents);
      const { posts } = parsedData;

      if (posts.length !== 0) {
        const newPosts = getNewPosts(posts, _store.posts);

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
      error: null,
      modalId: '',
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
    const store = onChange(initialStoreModel, (path) => {
      render(store, i18nextInstance, path, elements);
    });

    const validate = (url, urls) => {
      const schema = yup.string().url('InvalidRSSlink').notOneOf(urls, 'duplicateRSSlink').required('emptyInput');
      return schema.validate(url, { abortEarly: false });
    };

    elements.posts.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (id) {
        store.modalId = id;
        if (!store.visitedPosts.includes(id)) {
          store.visitedPosts.push(id);
        }
      }
    });

    autoAddNewPosts(store);

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.error = null;
      store.status = 'loading';
      const formData = new FormData(event.target);
      const link = formData.get('query');
      const links = store.feeds
        .map((feed) => feed.link);

      validate(link, links)
        .then((url) => fetchProxyRSS(url))
        .then((response) => {
          const parsedData = parse(response.data.contents);
          const { title, description, posts } = parsedData;
          const postsIdRev = posts.map((post) => ({ ...post, id: getId() }));
          const postsWithId = postsIdRev;
          store.feeds.push({ title, description, link });
          store.posts.push(...postsWithId);
          store.status = 'success';
        })
        .catch((error) => {
          if (error.message === 'Network Error') {
            store.error = 'networkError';
          } else {
            store.error = error.message;
          }
          store.status = 'failed';
        });
    });
  });
};

export default app;
