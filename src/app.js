import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parserV2 from './parse';
import {
  render, isLoading, renderContainer, showFeedback,
} from './view';
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
  const linksFromFeeds = _store.feeds
    .filter((feed) => feed.link)
    .map((feed) => feed.link);

  const getNewPosts = (newPosts, posts) => {
    const existingLinks = new Set(posts.map((post) => post.link));
    const filteredPosts = newPosts.filter((post) => !existingLinks.has(post.link));
    return filteredPosts;
  };

  const promises = linksFromFeeds.map((link) => fetchProxyRSS(link)
    .then((response) => {
      const data = JSON.stringify(response);
      const parsedData = parserV2(data);
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

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    resources: translations,
  }).then(() => {
    const initialStoreModel = {
      feeds: [],
      posts: [],
      startApp: 'not started',
      visitedPosts: [],
      feedback: null,
      isLoading: false,
      modalId: '',
    };

    const store = onChange(initialStoreModel, (path) => {
      if (store.startApp === 'inited') {
        render(store, i18nextInstance);
      }

      if (path === 'feedback') {
        showFeedback(store, i18nextInstance);
      }

      if (path === 'isLoading') {
        isLoading(store, i18nextInstance);
      }

      if (path === 'startApp') {
        if (store.startApp === 'inicialization') {
          renderContainer(store, i18nextInstance);
          autoAddNewPosts(store);
        }
      }
    });

    // --------------------------------------------------

    const validate = (url, urls) => {
      const schema = yup.string().url('InvalidRSSlink').notOneOf(urls, 'duplicateRSSlink').required('emptyInput');
      return schema.validate(url, { abortEarly: false });
    };

    // --------------------------------------------------

    const form = document.querySelector('.text-body');
    const containerListEl = document.querySelector('.posts');

    containerListEl.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (id) {
        store.modalId = id;
        if (!Array.from(store.visitedPosts).includes(id)) {
          store.visitedPosts.push(id);
        }
      }
    });

    const query = document.querySelector('#query');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.isLoading = true;

      const processRss = (link) => {
        const links = store.feeds
          .map((feed) => feed.link);

        validate(link, links)
          .then((url) => {
            if (store.startApp === 'not started') {
              store.startApp = 'inicialization';
            }
            return fetchProxyRSS(url);
          })
          .then((response) => {
            const data = JSON.stringify(response);
            const parsedData = parserV2(data);
            const { title, description, posts } = parsedData;
            const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId() }));
            store.feedback = 'successfulScenario';
            const postsWithId = postsIdRev;
            store.feeds.push({ title, description, link });
            store.posts.push(...postsWithId);
            if (store.startApp !== 'inited') {
              store.startApp = 'inited';
            }
          })
          .catch((error) => {
            if (error.message === 'Network Error') {
              store.feedback = 'networkError';
              return;
            }
            store.feedback = error.message;
          })
          .finally(() => {
            store.isLoading = false;
          });
      };
      processRss(query.value);
    });
  });
};

export default app;
