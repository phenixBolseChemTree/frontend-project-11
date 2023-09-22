import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
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

const loadFeed = (url, store) => {
  const proxyUrl = addProxyUrl(url);
  axios.get(proxyUrl)
    .then((response) => {
      const parsedData = parse(response.data.contents);
      const { title, description, posts } = parsedData;
      const feedId = _.uniqueId();
      const newPosts = posts.reverse().map((post) => ({ ...post, id: _.uniqueId(), feedId }));
      store.feeds.push({
        title, description, link: url, id: feedId,
      });

      store.posts.push(...newPosts);
      store.status = 'success';
    })
    .catch((error) => {
      if (error.isParsingError) {
        store.error = 'invalidRSS';
      } else if (error.isAxiosError) {
        store.error = 'networkError';
      } else {
        store.error = 'unknownError';
      }
      store.status = 'failed';
    });
};

const updateFeeds = (store) => {
  const getNewPosts = (newPosts, posts, feedId) => {
    console.log('posts!!!', posts);
    const existingLinks = posts
      .filter((post) => post.feedId === feedId)
      .map((post) => post.link);
    const filteredPosts = newPosts.filter((post) => !existingLinks.includes(post.link));
    return filteredPosts;
  };

  const promises = store.feeds.map(({ link, id }) => {
    const proxyUrl = addProxyUrl(link);
    return axios.get(proxyUrl)
      .then((response) => {
        const parsedData = parse(response.data.contents);
        const feedId = id;
        const { posts } = parsedData;
        if (posts.length !== 0) {
          const newPosts = getNewPosts(posts, store.posts, feedId);

          if (newPosts.length !== 0) {
            const postsWithId = newPosts
              .reverse()
              .map((post) => ({ ...post, id: _.uniqueId(), feedId }));

            store.posts.push(...postsWithId);
          }
        }
      })
      .catch((e) => {
        console.log('invalidRSS', e);
      });
  });

  return Promise.all(promises)
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
      console.log(store);
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
      const links = store.feeds.map((feed) => feed.link);

      validate(link, links)
        .then((response) => {
          loadFeed(response, store);
        })
        .catch((error) => {
          store.error = error.message;
          store.status = 'failed';
        });
    });
  });
};

export default app;
