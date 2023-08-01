const renderContainer = (store, i18n) => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

  const postsContent = `
    <div class="card border-0">
      <div class="card-body">
        ${store.posts?.length ? `<h2 class="card-title h4">${i18n.t('posts')}</h2>` : ''}
      </div>
    </div>
    <ul class="container-list list-group border-0 rounded-0"></ul>
  `;

  const feedsContent = `
    <div class="card border-0">
      <div class="card-body">
        ${store.feeds?.length ? `<h2 class="card-title h4">${i18n.t('feeds')}</h2>` : ''}
        <ul class="container-feeds list-group border-0 rounded-0">
          ${store.feeds.map((feedItem) => `<li class="list-group-item border-0 border-end-0">
            <h3 class="h6 m-0">${feedItem.title}</h3>
            <p class="m-0 small text-black-50">${feedItem.description}</p>
          </li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  postsEl.innerHTML = postsContent;
  feedsEl.innerHTML = feedsContent;
};

const renderFeeds = (store) => {
  const { feeds } = store;
  const { title, description } = feeds;
  const containerFeeds = document.querySelector('.container-feeds');
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
};

const renderPosts = (store, i18n) => {
  const container = document.querySelector('.container-list');
  const visitedPost = Array.from(store.visitedPosts);
  store.posts.forEach((item) => {
    const { title, link, id } = item;

    const titleTag = document.createElement('a');
    titleTag.textContent = title;
    titleTag.setAttribute('href', link);
    titleTag.setAttribute('target', '_blank');
    titleTag.setAttribute('data-link', id);
    if (visitedPost.includes(String(id))) {
      titleTag.classList.add('fw-normal', 'text-secondary');
    } else {
      titleTag.classList.add('fw-bold');
    }
    const descriptionTag = document.createElement('button');
    descriptionTag.textContent = i18n.t('check');
    descriptionTag.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    descriptionTag.setAttribute('data-id', id);
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
};

const showFeedback = (store, i18n) => {
  const { feedback } = store;
  const formResultEl = document.querySelector('#form-result');

  if (feedback !== 'successfulScenario') {
    formResultEl.classList.add('text-danger');
    formResultEl.classList.remove('text-success');
  } else {
    formResultEl.classList.remove('text-danger');
    formResultEl.classList.add('text-success');
  }
  formResultEl.textContent = i18n.t(feedback);
};

const openModal = (title, description, link) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const fullArticleLink = document.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticleLink.setAttribute('href', link);
};

const modalShow = (store) => {
  const { modalId, posts } = store;
  const targetContent = posts[modalId];
  const { title, description, link } = targetContent ?? {};
  openModal(title, description, link);
};

const isLoading = (store) => {
  const btn = document.querySelector('.btn-primary');
  if (store.isLoading) { // если да
    btn.disabled = true;
  } else {
    btn.disabled = false;
    const formElement = document.querySelector('form');
    const queryElement = formElement.querySelector('#query');
    queryElement.value = '';
  }
};

const render = (store, i18n) => {
  renderContainer(store, i18n);
  renderFeeds(store, i18n);
  renderPosts(store, i18n);
  showFeedback(store, i18n);
  modalShow(store, i18n);
  isLoading(store, i18n);
};

export default render;
