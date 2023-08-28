const renderContainer = (store, i18n, elements) => {
  console.log(elements);
  const postsEl = elements.posts;
  const feedsEl = elements.feeds;

  postsEl.textContent = '';
  feedsEl.textContent = '';

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

const renderFeeds = (store, i18nextInstance, elements) => {
  const { feeds } = store;
  const containerFeeds = elements.feeds;
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
    titleTag.setAttribute('data-id', id);
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

const showFeedback = (store, i18n, elements) => {
  const feedbackContainer = elements.feedback;
  if (store.status === 'success') {
    feedbackContainer.classList.remove('text-danger');
    feedbackContainer.classList.add('text-success');
    feedbackContainer.textContent = i18n.t('successfulScenario');
  } else {
    const { feedback } = store;
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.classList.remove('text-success');
    feedbackContainer.textContent = i18n.t(feedback);
  }
};

const openModal = (title, description, link, elements) => {
  const modalTitle = elements.modal.querySelector('.modal-title');
  const modalBody = elements.modal.querySelector('.modal-body');
  const fullArticleLink = elements.modal.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticleLink.setAttribute('href', link);
};

const modalShow = (store, i18nextInstance, elements) => {
  const { modalId, posts } = store;
  const targetContent = posts[modalId];
  const { title, description, link } = targetContent ?? {};
  openModal(title, description, link, elements);
};

const renderLoading = (btn, elements) => {
  const btnTag = elements.button;
  if (btn === 'closed') {
    btnTag.disabled = true;
  } else {
    btnTag.disabled = false;
    const queryElement = elements.query;
    queryElement.value = '';
  }
};

const renderContent = (store, i18n, elements) => {
  renderFeeds(store, i18n, elements);
  renderPosts(store, i18n, elements);
  showFeedback(store, i18n, elements);
};

const render = (store, i18nextInstance, path, elements) => {
  switch (path) {
    case 'status':
      switch (store.status) {
        case 'loading':
          renderLoading('closed', elements);
          break;
        case 'idle':
          renderLoading('open', elements);
          break;
        case 'success':
          renderContainer(store, i18nextInstance, elements);
          renderContent(store, i18nextInstance, elements);
          break;
        case 'failed':
          showFeedback(store, i18nextInstance, elements);
          break;
        case 'filling':
          renderLoading('open', elements);
          // showFeedback(store, i18nextInstance, elements);
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  if (store.status !== 'success' && path === 'posts' && store.status !== 'loading') {
    renderPosts(store, i18nextInstance, elements); // for autoAddPost
  }
  if (path === 'modalId') {
    modalShow(store, i18nextInstance, elements);
  }
  if (path === 'visitedPosts') {
    renderPosts(store, i18nextInstance, elements);
  }
};

export default render;
