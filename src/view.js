const createCard = (title, className) => {
  const card = document.createElement('div');
  card.className = `card border-0 ${className}`;

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const cardTitle = document.createElement('h2');
  cardTitle.className = `card-title ${className}-title h4`;
  cardTitle.textContent = title;

  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);

  return card;
};

const renderFeeds = (store, i18n, elements) => {
  const feedsEl = elements.feeds;
  feedsEl.textContent = '';

  const feedsCard = createCard(i18n.t('feeds'), 'feeds');

  const feedsList = document.createElement('ul');
  feedsList.className = 'container-feeds list-group border-0 rounded-0';

  feedsEl.appendChild(feedsCard);
  feedsEl.appendChild(feedsList);

  const { feeds } = store;

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

    feedsList.appendChild(liTag);
  });
};

const renderPosts = (store, i18n, elements) => {
  const postsEl = elements.posts;
  postsEl.textContent = '';

  const postsCard = createCard(i18n.t('posts'), '');

  const postsList = document.createElement('ul');
  postsList.className = 'container-list list-group border-0 rounded-0';

  postsEl.appendChild(postsCard);
  postsEl.appendChild(postsList);

  const visitedPost = store.visitedPosts;
  store.posts.forEach((item) => {
    const { title, link, id } = item;

    const titleTag = document.createElement('a');
    titleTag.textContent = title;
    titleTag.setAttribute('href', link);
    titleTag.setAttribute('target', '_blank');
    titleTag.setAttribute('data-id', id);
    if (visitedPost.includes(id)) {
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
    postsList.append(li);
  });
};

const showError = (store, i18n, elements) => {
  const feedbackContainer = elements.feedback;
  if (store.status === 'success') {
    feedbackContainer.classList.remove('text-danger');
    feedbackContainer.classList.add('text-success');
    feedbackContainer.textContent = i18n.t('successfulScenario');
  } else {
    const { error } = store;
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.classList.remove('text-success');
    feedbackContainer.textContent = i18n.t(error);
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
  const targetContent = posts.find((post) => post.id === modalId);
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

const render = (store, i18nextInstance, path, elements) => {
  switch (path) {
    case 'status':
      switch (store.status) {
        case 'loading':
          renderLoading('closed', elements);
          break;
        case 'success':
          renderLoading('open', elements);
          showError(store, i18nextInstance, elements);
          break;
        case 'failed':
          renderLoading('open', elements);
          showError(store, i18nextInstance, elements);
          break;
        default:
          break;
      }
      break;
    case 'posts':
      renderPosts(store, i18nextInstance, elements); // for autoAddPost
      break;
    case 'feeds':
      renderFeeds(store, i18nextInstance, elements);
      break;
    case 'visitedPosts':
      renderPosts(store, i18nextInstance, elements);
      break;
    case 'modalId':
      modalShow(store, i18nextInstance, elements);
      break;
    default:
      break;
  }
};

export default render;
