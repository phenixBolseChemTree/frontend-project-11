import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parse from './parse';
import render from './view';
import translations from './locales/ru';

const addProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.append('url', url);
  proxyUrl.searchParams.append('disableCache', 'true');
  return proxyUrl.toString();
};

const fetchProxyRSS = (url) => {
  const proxyUrl = addProxyUrl(url);
  return axios.get(proxyUrl);
};

const getId = (() => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
})();

const getIdForFeed = (() => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
})();

const loadFeed = (response, store, link) => {
  try {
    const parsedData = parse(response.data.contents);
    const { title, description, posts } = parsedData;
    const feedId = getIdForFeed();
    const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId(), feedId }));
    const postsWithId = postsIdRev;
    store.feeds.push({
      title, description, link, id: feedId,
    });
    store.posts.push(...postsWithId);
    store.status = 'success';
  } catch (error) {
    switch (true) {
      case error.isParsingError:
        store.error = 'invalidRSS';
        break;
      default:
        store.error = 'unknownError';
    }
    store.status = 'failed';
  }
};

const updateFeeds = (store) => {
  const getNewPosts = (newPosts, posts) => {
    const existingLinks = posts.map((post) => post.link);
    const filteredPosts = newPosts.filter((post) => !existingLinks.includes(post.link));
    return filteredPosts;
  };

  const promises = store.feeds.map(({ link, id }) => fetchProxyRSS(link)
    .then((response) => {
      const parsedData = parse(response.data.contents);
      const { posts } = parsedData;
      if (posts.length !== 0) {
        const newPosts = getNewPosts(posts, store.posts);

        if (newPosts.length !== 0) {
          const feedId = id;
          const postsWithId = newPosts.reverse().map((post) => ({ ...post, id: getId(), feedId }));
          store.posts.push(...postsWithId);
        }
      }
    })
    .catch((e) => {
      console.log('invalidRSS', e);
    }));

  Promise.all(promises)
    .then(() => {
      setTimeout(() => updateFeeds(store), 5000);
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
      console.log(store.posts);
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

    updateFeeds(store);

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
          loadFeed(response, store, link);
        })
        .catch((error) => {
          switch (true) {
            case error.name === 'ValidationError':
              store.error = error.message;
              break;
            case error.isAxiosError:
              store.error = 'networkError';
              break;
            default:
              store.error = 'unknownError';
          }
          store.status = 'failed';
        });
    });
  });
};

export default app;
