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

// const processRssAuto = (_store, link) => {
//   let newPosts = [];
//   fetchProxyRSS(link)
//     .then((response) => {
//       if (response.status === 200) {
//         const domParser = new DOMParser();
//         const data = domParser.parseFromString(response.data.contents, 'application/xml');
//         const parsedData = parserV2(data);
//         const { posts } = parsedData;
//         // на этом этапе ставим id в данные с парсера -------------------------------
//         // const postsWithId = posts.map(post => (
//         //   return { post }
//         // ))
//         // проходимся по постам и добавляем к постам id

//         if (posts.length !== 0) {
//           newPosts = getNewPosts(posts, _store.posts).reverse();
//           if (newPosts.length !== 0) {
//             _store.posts.push(...newPosts);
//           }
//         }
//         return posts;
//         // new
//       }
//       return response; // здесь может быть ошибка!!!
//     })
//     .catch((e) => {
//       console.log('invalidRSS', e);
//     })
//     .finally(() => {
//       // Запускать цикл обновления постов нужно один раз независимо от сабмита,
//       // иначе на каждый сабмит будет запускаться еще один цикл обновления
//       // можно пушить новые посты в
//       setTimeout(() => processRssAuto(_store, link), 5000);
//     });
// };

// const processRssAuto = (_store, _link) => {
//   console.log('_store.links.length', _store.links.length);
//   // считывать ссылки в links (и проверять нет ли новых постов)
//   // попробовать хранить посты в отдельных массивах
// };

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
      const { links, posts } = _store;
      const linksArr = Array.from(links);
      if (linksArr.length) {
        // console.log(Array.from(store.links));
        console.log('!!!posts', posts);
        console.log('!!!links', links);
        linksArr.forEach((link) => {
          let newPosts = [];
          fetchProxyRSS(link)
            .then((response) => {
              if (response.status === 200) {
                const domParser = new DOMParser();
                const data = domParser.parseFromString(response.data.contents, 'application/xml');
                const parsedData = parserV2(data);
                const { posts } = parsedData;
                // на этом этапе ставим id в данные с парсера -------------------------------
                // проходимся по постам и добавляем к постам id

                if (posts.length !== 0) {
                  newPosts = getNewPosts(posts.reverse(), _store.posts);
                  if (newPosts.length !== 0) {
                    const postsWithId = newPosts.map((post) => ({ ...post, id: getId() }));
                    _store.posts.push(...postsWithId);
                  }
                }
                return posts;
              }
              return response; // здесь может быть ошибка!!!
            })
            .catch((e) => {
              console.log('invalidRSS', e);
            });
        });
      }
      // if (_store.links)
      setTimeout(() => autoAddNewPosts(_store), 5000);
    };

    autoAddNewPosts(store);

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
                .then((response) => {
                  store.lastResponse = response;
                  if (response.status === 200 || response?.status?.http_code === 200) {
                    const domParser = new DOMParser();
                    const data = domParser.parseFromString(response.data.contents, 'application/xml');
                    const parsedData = parserV2(data);
                    if (parsedData !== 'invalidRSS') {
                      const { title, description, posts } = parsedData;
                      // дать постам id ------------------
                      const postsIdRev = posts.reverse().map((post) => ({ ...post, id: getId() }));
                      const postsWithId = postsIdRev;

                      // console.log('!!!postsWithId', postsWithId);
                      // на этом этапе ставим id в данные с парсера -------------------------------
                      // console.log('обрабатываем эти посты!!!', posts);

                      store.feeds.push({ title, description });
                      store.links.push(link);
                      store.posts.push(...postsWithId);
                      store.feedback = 'successfulScenario';
                      // setTimeout(() => processRssAuto(store, link), 5000);
                      // записать в finaly и сделать условие если не равно пустому
                    } else {
                      store.feedback = 'invalidRSS';
                    }
                  } else {
                    store.feedback = 'invalidRSS';
                  }
                })
                .catch(() => {
                  // сдесь еще нужно обробатывать 1 ошибку из parserV2
                  // или вынести преобразование и что то глобально поменять
                  store.feedback = 'networkError';
                })
                .finally(() => {
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
