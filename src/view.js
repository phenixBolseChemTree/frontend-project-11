const renderContainer = (store, i18n) => {
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

  while (postsEl.firstChild) {
    postsEl.removeChild(postsEl.firstChild);
  }
  while (feedsEl.firstChild) {
    feedsEl.removeChild(feedsEl.firstChild);
  }

  const createCard = (title) => {
    const card = document.createElement('div');
    card.className = 'card border-0';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    if (title) {
      const cardTitle = document.createElement('h2');
      cardTitle.className = 'card-title h4';
      cardTitle.textContent = title;
      cardBody.appendChild(cardTitle);
    }

    card.appendChild(cardBody);

    return card;
  };

  const postsContent = createCard(store.posts?.length ? i18n.t('posts') : null);
  const postsList = document.createElement('ul');
  postsList.className = 'container-list list-group border-0 rounded-0';
  postsContent.appendChild(postsList);
  postsEl.appendChild(postsContent);

  const feedsContent = createCard(store.feeds?.length ? i18n.t('feeds') : null);
  const feedsList = document.createElement('ul');
  feedsList.className = 'container-feeds list-group border-0 rounded-0';
  feedsContent.appendChild(feedsList);
  feedsEl.appendChild(feedsContent);
};

const renderFeeds = (store) => {
  const container = document.querySelector('.container-feeds');
  store.feeds.forEach(({ title, description }) => {
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

    container.prepend(liTag);
  });
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
