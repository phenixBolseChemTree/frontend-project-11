import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import { parser, pickOnlyNewPosts, parseData } from './process';
import { renderFeed, renderPosts, renderContainer } from './render';
import translations from './locales/ru';

const app = () => {
  // i18nInit();
  i18next.init({
    lng: 'ru',
    resources: translations,
  }).then(() => {
    const initialStoreValues = {
      feed: [],
      posts: [],
      links: [],
      visitedPosts: [],
      feedback: null,
      isLoading: false,
      lastResponse: null,
    };

    const formResultEl = document.querySelector('#form-result');

    const showFeedback = (text) => {
      if (text !== 'successfulScenario') {
        formResultEl.classList.add('text-danger');
        formResultEl.classList.remove('text-success');
      } else {
        formResultEl.classList.remove('text-danger');
        formResultEl.classList.add('text-success');
      }
      formResultEl.textContent = i18next.t(text);
    };

    const store = onChange(initialStoreValues, (path, value) => {
      if (path === 'feed') {
        renderFeed(value[value.length - 1]);
      }
      if (path === 'posts') {
        renderPosts(store);
      }

      if (path === 'feedback') {
        showFeedback(value);
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

    const fetchRSS = (link) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`);

    const processRssAuto = (_store, link, lastDataArg) => {
      let lastDateNumber = lastDataArg;
      let newPosts = [];
      fetchRSS(link)
        .then((response) => {
          if (response.status === 200) {
            const domXML = parser(response);
            return domXML;
          }
          return response;
        })
        .then((data) => parseData(data))
        .then((data) => {
          if (data.length !== 0) {
            newPosts = pickOnlyNewPosts(data, lastDataArg).reverse();
            if (newPosts.length !== 0) {
              _store.posts.push(...newPosts);
              const currentlastData = data[0].pubDate;
              lastDateNumber = Date.parse(currentlastData);
            }
          }
          return data;
        })
        .catch((e) => {
          console.log('invalidRSS', e);
        })
        .finally(() => {
          setTimeout(() => processRssAuto(_store, link, lastDateNumber), 5000);
        });
    };

    const rssSchema = yup.string().url().required();

    const formElement = document.querySelector('form');
    const queryElement = formElement.querySelector('#query');

    const form = document.querySelector('.text-body');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.isLoading = true;

      const query = document.querySelector('#query').value;

      const processRss = (link) => {
        rssSchema.validate(link)
          .then(() => {
            if (!store.links.includes(link)) {
              fetchRSS(link)
                .then((data) => {
                  store.lastResponse = data;
                  if (data.status === 200 || data?.status?.http_code === 200) {
                    const domXML = parser(data);
                    if (domXML !== 'invalidRSS') {
                      const title = domXML.querySelector('title').textContent;
                      const description = domXML.querySelector('description').textContent;
                      if (!store.feed.length) {
                        renderContainer();
                      }
                      store.feed.push({ title, description });
                      store.links.push(link);
                      const posts = parseData(domXML);
                      store.posts.push(...posts.reverse());
                      const lastData = posts[posts.length - 1].pubDate;
                      const lastDateNumber = Date.parse(lastData);
                      store.feedback = 'successfulScenario';
                      setTimeout(() => processRssAuto(store, link, lastDateNumber), 5000);
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
