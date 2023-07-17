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
      console.log('triger', value);
      render(store, i18next);
    });

    render(store, i18next);

    const rssSchema = yup.string().url().required();

    const formElement = document.querySelector('form');
    const queryElement = formElement.querySelector('#query');

    const form = document.querySelector('.text-body');

    const containerListEl = document.querySelector('.posts');

    console.log('!!!containerListEl', containerListEl);

    containerListEl.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const link = e.target.getAttribute('data-link');

      if (id) {
        store.liChildTarget = id;
      }

      if (link) {
        store.visitedPosts.push(link);
      }
    });

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
                    console.log('!!!postsINIT+', parsedData);

                    if (parsedData !== 'invalidRSS') {
                      const { title, description, posts } = parsedData;
                      store.feed.push({ title, description });
                      store.links.push(link);
                      store.posts.push(...posts.reverse());

                      // const form = {
                      //   feed: [...store.feed, { title, description }],
                      //   links: [...store.links, link],
                      //   posts: [...store.posts, ...posts.reverse()],
                      // };
                      // store.form = form;

                      // onChange(data);
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
