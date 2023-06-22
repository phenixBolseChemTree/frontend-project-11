import i18next from 'i18next';

// сдесь мы должны добавлять
const initData = () => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

// Создаем содержимое для добавления в элементы
const postsContent = `
  <div class="card border-0">
    <h2 class="lng-posts card-title h4">${i18next.t('posts')}</h2>
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

// Добавляем содержимое в элементы
postsEl.innerHTML = postsContent;
feedsEl.innerHTML = feedsContent;
};

export default initData;
