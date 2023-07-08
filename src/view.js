import i18next from 'i18next';

const view = {
  renderContainer: () => {
    const postsEl = document.querySelector('.posts');
    const feedsEl = document.querySelector('.feeds');

    const postsContent = `
  <div class="card border-0">
  <div class="card-body">
    <h2 class="card-title h4">${i18next.t('posts')}</h2>
    </div>
  </div>
  <ul class="container-list list-group border-0 rounded-0"></ul>
`;

    const feedsContent = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18next.t('feeds')}</h2>
      <ul class="container-feeds list-group border-0 rounded-0"></ul>
    </div>
  </div>
`;

    postsEl.innerHTML = postsContent;
    feedsEl.innerHTML = feedsContent;
  },

  renderFeed: (feed) => {
    const containerFeeds = document.querySelector('.container-feeds');
    const { title, description } = feed;
    const titleTeg = document.createElement('h3');
    titleTeg.classList.add('h6', 'm-0');
    titleTeg.textContent = title;

    const descriptionTag = document.createElement('p');
    descriptionTag.classList.add('m-0', 'small', 'text-black-50');
    descriptionTag.textContent = description;

    const liTag = document.createElement('li');
    liTag.classList.add('list-group-item', 'border-0', 'border-end-0');

    liTag.appendChild(titleTeg);
    liTag.appendChild(descriptionTag);

    containerFeeds.prepend(liTag);
  },

  renderPosts: (store) => {
    const container = document.querySelector('.container-list');
    container.innerHTML = '';
    store.posts.forEach((item, index) => {
      const { title, link } = item;

      const titleTag = document.createElement('a');
      titleTag.textContent = title;
      titleTag.setAttribute('href', link);
      titleTag.setAttribute('target', '_blank');

      const descriptionTag = document.createElement('button');
      descriptionTag.textContent = i18next.t('check');
      if (store.visitedPosts.includes(link)) {
        titleTag.classList.add('fw-normal', 'text-secondary');
      } else {
        titleTag.classList.add('fw-bold');
      }

      descriptionTag.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      descriptionTag.setAttribute('data-id', index);
      descriptionTag.setAttribute('data-bs-toggle', 'modal');
      descriptionTag.setAttribute('data-bs-target', '#modal');

      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );
      li.appendChild(titleTag);
      li.appendChild(descriptionTag);

      container.prepend(li);
    });
  },

  renderModal: (title, description, link) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const fullArticleLink = document.querySelector('.full-article');

    modalTitle.textContent = title;
    modalBody.textContent = description;
    fullArticleLink.setAttribute('href', link);
  },
};
export default view;
