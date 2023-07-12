import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parserV2 from './parse';
import {
  renderFeed, renderPosts, renderContainer, showFeedback, handleChildLi,
} from './view';
import translations from './locales/ru';

const app = () => {
  i18next.init({
    lng: 'ru',
    resources: translations,
  }).then(() => {
    const initialStoreModel = {
      feed: [],
      posts: [],
      links: [],
      visitedPosts: [],
      feedback: null,
      isLoading: false,
      lastResponse: null,
      liChildTarget: null,
    };

    const store = onChange(initialStoreModel, (path, value) => {
      if (path === 'feed') {
        renderFeed(value[value.length - 1]);
      }
      if (path === 'posts') {
        renderPosts(store);
      }

      if (path === 'feedback') {
        showFeedback(value);
      }

      if (path === 'liChildTarget') {
        console.log('event.target: ', value.target);
        handleChildLi(value, store);
      }

      if (path === 'isLoading') {
        const btn = document.querySelector('.btn-primary');
        if (value === true) {
          btn.disabled = true;
        } else {
          btn.disabled = false;
        }
      }
    });

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

    const processRssAuto = (_store, link) => {
      let newPosts = [];
      fetchProxyRSS(link)
        .then((response) => {
          if (response.status === 200) {
            const parsedData = parserV2(response);
            return parsedData;
          }
          return response; // здесь может быть ошибка!!!
        })
        .then(({ posts }) => {
          if (posts.length !== 0) {
            newPosts = getNewPosts(posts, _store.posts).reverse();
            console.log('!!!newPosts!!!', newPosts);
            if (newPosts.length !== 0) {
              _store.posts.push(...newPosts);
            }
          }
          return posts;
        })
        .catch((e) => {
          console.log('invalidRSS', e);
        })
        .finally(() => {
          setTimeout(() => processRssAuto(_store, link), 5000);
        });
    };

    const rssSchema = yup.string().url().required();

    const formElement = document.querySelector('form');
    const queryElement = formElement.querySelector('#query');

    const form = document.querySelector('.text-body');

    // ----------------
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.isLoading = true;

      const query = document.querySelector('#query').value;

      const processRss = (link) => {
        rssSchema.validate(link)
          .then(() => {
            if (!store.links.includes(link)) {
              fetchProxyRSS(link)
                .then((data) => {
                  store.lastResponse = data;
                  if (data.status === 200 || data?.status?.http_code === 200) {
                    const parsedData = parserV2(data);
                    if (parsedData !== 'invalidRSS') {
                      const { title, description, posts } = parsedData;
                      if (!store.feed.length) {
                        renderContainer();
                        const containerListEl = document.querySelector('.container-list');
                        containerListEl.addEventListener('click', (e) => {
                          store.liChildTarget = e;
                        });
                      }
                      // вместо прямых вызовов нужно делать все через view
                      // нужно делать типо так? view(store)
                      // watchedState.feed.push({title, description})
                      store.feed.push({ title, description });
                      store.links.push(link);
                      store.posts.push(...posts.reverse());
                      store.feedback = 'successfulScenario';
                      setTimeout(() => processRssAuto(store, link), 5000);
                    } else {
                      store.feedback = 'invalidRSS';
                    }
                  } else {
                    store.feedback = 'invalidRSS';
                  }
                })
                .catch(() => {
                  store.feedback = 'networkError';
                })
                .finally(() => {
                  queryElement.value = '';
                  store.isLoading = false;
                });
            } else {
              store.feedback = 'duplicateRSSlink';
              store.isLoading = false;
            }
          })
          .catch(() => {
            store.feedback = 'InvalidRSSlink';
          });
      };

      processRss(query);
    });
  });
};

export default app;
