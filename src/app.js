import './styles.scss';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import parserV2 from './parser';
import view from './view';
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

    const handleChildLi = (e, store) => {
      if (e.target.tagName === 'BUTTON') {
        const button = e.target;
        const a = button.previousElementSibling;

        const { id } = e.target.dataset;
        const targetContent = store.posts[id];
        const { title, description, link } = targetContent ?? {};

        view.renderModal(title, description, link);

        store.visitedPosts.push(link);
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'text-secondary');
        // console.log(title, description, link);
      } else {
        const a = e.target;
        const link = a.href;
        store.visitedPosts.push(link);
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'text-secondary');
      }
    };

    const store = onChange(initialStoreModel, (path, value) => {
      if (path === 'feed') {
        view.renderFeed(value[value.length - 1]);
      }
      if (path === 'posts') {
        view.renderPosts(store);
      }

      if (path === 'feedback') {
        showFeedback(value);
      }

      if (path === 'liChildTarget') {
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
            newPosts = getNewPosts(posts, _store.posts);
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
                        view.renderContainer();
                        const containerListEl = document.querySelector('.container-list');
                        containerListEl.addEventListener('click', (e) => {
                          store.liChildTarget = e;
                          // console.log('Позднее связывание работает!!!', store.posts[id]);
                          // нужно передавать id в функцию с модальным окном и работать там
                        });
                      }
                      store.feed.push({ title, description });
                      store.links.push(link);
                      store.posts.push(...posts.reverse());
                      // const lastData = posts[posts.length - 1].pubDate;
                      // const lastDateNumber = Date.parse(lastData);
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
