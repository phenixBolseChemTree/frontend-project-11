const renderContainer = (store, i18n) => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

  const postsCard = document.createElement('div');
  postsCard.className = 'card border-0';

  const postsCardBody = document.createElement('div');
  postsCardBody.className = 'card-body';

  const postsCardTitle = document.createElement('h2');
  postsCardTitle.className = 'card-title h4';
  postsCardTitle.textContent = i18n.t('posts');

  postsCardBody.appendChild(postsCardTitle);
  postsCard.appendChild(postsCardBody);

  const postsList = document.createElement('ul');
  postsList.className = 'container-list list-group border-0 rounded-0';

  postsEl.appendChild(postsCard);
  postsEl.appendChild(postsList);

  const feedsCard = document.createElement('div');
  feedsCard.className = 'card border-0';

  const feedsCardBody = document.createElement('div');
  feedsCardBody.className = 'card-body';

  const feedsCardTitle = document.createElement('h2');
  feedsCardTitle.className = 'card-title h4';
  feedsCardTitle.textContent = i18n.t('feeds');

  feedsCardBody.appendChild(feedsCardTitle);
  feedsCard.appendChild(feedsCardBody);

  const feedsList = document.createElement('ul');
  feedsList.className = 'container-feeds list-group border-0 rounded-0';

  feedsEl.appendChild(feedsCard);
  feedsEl.appendChild(feedsList);
};

const renderFeeds = (store) => {
  const { feeds } = store;
  const containerFeeds = document.querySelector('.container-feeds');
  containerFeeds.textContent = '';

  feeds.forEach((feedItem) => {
    const liTag = document.createElement('li');
    liTag.className = 'list-group-item border-0 border-end-0';

    const titleTeg = document.createElement('h3');
    titleTeg.className = 'h6 m-0';
    titleTeg.textContent = feedItem.title;

    const descriptionTag = document.createElement('p');
    descriptionTag.className = 'm-0 small text-black-50';
    descriptionTag.textContent = feedItem.description;

    liTag.appendChild(titleTeg);
    liTag.appendChild(descriptionTag);

    containerFeeds.appendChild(liTag);
  });
};

const renderPosts = (store, i18n) => {
  const container = document.querySelector('.container-list');
  container.textContent = '';
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
  if (store.isLoading) {
    btn.disabled = true;
  } else {
    btn.disabled = false;
    const formElement = document.querySelector('form');
    const queryElement = formElement.querySelector('#query');
    queryElement.value = '';
  }
};

const render = (store, i18n) => {
  renderFeeds(store, i18n);
  renderPosts(store, i18n);
  showFeedback(store, i18n);
  modalShow(store, i18n);
};

export {
  render, isLoading, renderContainer,
};
