import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parserV2 from './parse';
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

const getNewPosts = (newPosts, posts) => {
  const existingLinks = new Set(posts.map((post) => post.link));
  const filteredPosts = newPosts.filter((post) => !existingLinks.has(post.link));
  return filteredPosts;
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
      visitedPosts: [],
      autoAddNewPosts: false,
      feedback: null,
      isLoading: false,
      lastResponse: null,
      liChildTarget: null,
      modalId: '',
    };

    const store = onChange(initialStoreModel, () => {
      render(store, i18nextInstance);
    });

    const autoAddNewPosts = (_store) => {
      console.log('отработал!');
      const linksFromFeeds = _store.feeds
        .filter((feed) => feed.link)
        .map((feed) => feed.link);
      linksFromFeeds.forEach((link) => {
        let newPosts = [];
        fetchProxyRSS(link)
          .then((response) => {
            const data = JSON.stringify(response);
            const parsedData = parserV2(data);
            const { posts } = parsedData;
            if (posts.length !== 0) {
              newPosts = getNewPosts(posts.reverse(), _store.posts);
              if (newPosts.length !== 0) {
                const postsWithId = newPosts.map((post) => ({ ...post, id: getId() }));
                _store.posts.push(...postsWithId);
              }
            }
            return posts;
          })
          .catch((e) => {
            console.log('invalidRSS', e);
          });
      });

      setTimeout(() => autoAddNewPosts(_store), 5000);
    };

    const rssSchema = yup.string().test(
      'is-valid-rss',
      'invalidRSS',
      (link) => new Promise((resolve) => {
        if (!yup.string().url().isValidSync(link)) {
          store.feedback = 'invalidRSS';
          store.isLoading = false;
          return;
        }

        const linkFromFeeds = store.feeds
          .filter((feed) => feed.link)
          .map((feed) => feed.link);
        if (linkFromFeeds.includes(link)) {
          store.feedback = 'duplicateRSSlink';
          store.isLoading = false;
          return;
        }

        fetchProxyRSS(link)
          .then((response) => {
            console.log('response.status === 200', response.status === 200);
            console.log('response?.data?.status?.http_code === 200', response?.data?.status?.http_code === 200);
            console.log('response.data.status.content_type.includes("application/rss+xml")', response?.data?.status?.content_type.includes('application/rss+xml'));
            if (response.status === 200 && response?.data?.status?.content_type.includes('application/rss+xml')) {
              store.feedback = 'successfulScenario';
              console.log('response', response);
              resolve(true);
            } else {
              store.feedback = 'invalidRSS';
              store.isLoading = false;
            }
          })
          .catch(() => {
            store.feedback = 'networkError';
            store.isLoading = false;
          });
      }),
    );

    const form = document.querySelector('.text-body');
    const containerListEl = document.querySelector('.posts');

    containerListEl.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      console.log('takeID', id);
      const link = e.target.getAttribute('data-link');
      if (id) {
        store.modalId = id;
        if (!Array.from(store.visitedPosts).includes(id)) {
          store.visitedPosts.push(id);
        }
      }
      if (link) {
        if (!Array.from(store.visitedPosts).includes(link)) {
          store.visitedPosts.push(link);
        }
      }
    });

    const query = document.querySelector('#query');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.isLoading = true;

      const processRss = (link) => {
        rssSchema.validate(link)
          .then(() => {
            if (store.feedback === 'successfulScenario') {
              fetchProxyRSS(link)
                .then((response) => {
                  store.lastResponse = response;
                  const data = JSON.stringify(response);
                  const parsedData = parserV2(data);
                  const { title, description, posts } = parsedData;
                  const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId() }));
                  const postsWithId = postsIdRev;
                  store.feeds.push({ title, description, link });
                  store.posts.push(...postsWithId);
                  if (store.autoAddNewPosts === false) {
                    store.autoAddNewPosts = true;
                    autoAddNewPosts(store);
                  }
                })
                .finally(() => {
                  store.isLoading = false;
                });
            }
          });
      };
      processRss(query.value);
    });
  });
};

export default app;
