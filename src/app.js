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

const getNewPosts = (newPosts, posts) => {
  const existingLinks = new Set(posts.map((post) => post.link));
  const filteredPosts = newPosts.filter((post) => !existingLinks.has(post.link));
  return filteredPosts;
};

const getId = (() => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
})();

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    resources: translations,
  }).then(() => {
    const initialStoreModel = {
      feeds: [],
      posts: [],
      links: [],
      visitedPosts: [],
      autoAddNewPosts: false,
      writing: '',
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
      const { links } = _store;
      const linksArr = Array.from(links);
      linksArr.forEach((link) => {
        let newPosts = [];
        fetchProxyRSS(link)
          .then((response) => {
            if (response.status === 200) {
              const domParser = new DOMParser();
              const data = domParser.parseFromString(response.data.contents, 'application/xml');
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
            }
            return response;
          })
          .catch((e) => {
            console.log('invalidRSS', e);
          });
      });

      setTimeout(() => autoAddNewPosts(_store), 5000);
    };

    const rssSchema = yup.string().url().required();
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
    const inputElement = document.getElementById('query');

    query.addEventListener('input', (e) => {
      store.writing = e.target.value;
      inputElement.value = store.writing;
    });

    // ----------------
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.isLoading = true;

      const processRss = (link) => {
        rssSchema.validate(link)
          .then(() => {
            if (!store.links.includes(link)) {
              fetchProxyRSS(link)
                .then((response) => {
                  store.lastResponse = response;
                  if (response.status === 200 || response?.status?.http_code === 200) {
                    const domParser = new DOMParser();
                    const data = domParser.parseFromString(response.data.contents, 'application/xml');
                    const parsedData = parserV2(data);
                    if (parsedData !== 'invalidRSS') {
                      const { title, description, posts } = parsedData;
                      const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId() }));
                      const postsWithId = postsIdRev;
                      store.feeds.push({ title, description });
                      store.posts.push(...postsWithId);
                      store.links.push(link);
                      if (store.autoAddNewPosts === false) {
                        store.autoAddNewPosts = true;
                        autoAddNewPosts(store);
                      }
                      store.feedback = 'successfulScenario';
                    } else {
                      store.feedback = 'invalidRSS';
                    }
                  } else {
                    store.feedback = 'invalidRSS';
                  }
                })
                .catch((e) => {
                  if (e.message === 'invalidRSS') {
                    store.feedback = 'invalidRSS';
                  } else {
                    store.feedback = 'networkError';
                  }
                })
                .finally(() => {
                  store.isLoading = false;
                  store.writing = '';
                });
            } else {
              store.feedback = 'duplicateRSSlink';
              store.isLoading = false;
            }
          })
          .catch(() => {
            store.feedback = 'InvalidRSSlink';
            store.isLoading = false;
          });
      };
      processRss(query.value);
    });
  });
};

export default app;
