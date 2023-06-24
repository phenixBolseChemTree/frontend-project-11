import i18next from 'i18next';

const initContainer = () => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

const postsContent = `
  <div class="card border-0">
  <div class="card-body">
    <h2 class="lng-posts card-title h4">${i18next.t('posts')}</h2>
    </div>
  </div>
  <ul class="container-list list-group border-0 rounded-0"></ul>
`;

const feedsContent = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="lng-feeds card-title h4">${i18next.t('feeds')}</h2>
      <ul class="container-feeds list-group border-0 rounded-0"></ul>
    </div>
  </div>
`;

postsEl.innerHTML = postsContent;
feedsEl.innerHTML = feedsContent;
};

export default initContainer;
