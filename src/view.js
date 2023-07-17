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
        ${store.feed?.length ? `<h2 class="card-title h4">${i18n.t('feeds')}</h2>` : ''}
        <ul class="container-feeds list-group border-0 rounded-0">
          ${store.feed.map((feedItem) => `<li class="list-group-item border-0 border-end-0">
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

const renderFeed = (store) => {
  const { feed } = store;
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
};

const renderPosts = (store, i18n) => {
  const container = document.querySelector('.container-list');
  store.posts.forEach((item, index) => {
    const { title, link, id } = item;

    const titleTag = document.createElement('a');
    titleTag.textContent = title;
    titleTag.setAttribute('href', link);
    titleTag.setAttribute('target', '_blank');
    titleTag.setAttribute('data-link', index);
    // мне нужно проверить что в массиве нет такого id
    console.log('id', id);
    if (Array.from(store.visitedPosts).includes(id)) {
      titleTag.classList.add('fw-normal', 'text-secondary');
    } else {
      titleTag.classList.add('fw-bold');
    }
    const descriptionTag = document.createElement('button');
    descriptionTag.textContent = i18n.t('check');
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

    // if (!store.visitedPosts.includes(item.id)) {
    //   // console.log('!!!item.id', item);
    //   li.classList.add('text-secondary');
    // }

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

const handleChildLi = (store) => {
  console.log('!!!handleChildLi', store.liChildTarget?.target);

  const { liChildTarget } = store;

  if (!liChildTarget) {
    return;
  }

  const id = store.liChildTarget;
  const targetContent = store.posts[id];
  const { title, description, link } = targetContent ?? {};

  openModal(title, description, link);

  // if (liChildTarget.target.tagName === 'BUTTON') {

  // console.log(title, description, link);
  // } else {
  //   const a = liChildTarget.target;
  //   const link = a.href;
  //   store.visitedPosts.push(link);
  //   a.classList.remove('fw-bold');
  //   a.classList.add('fw-normal', 'text-secondary');
  // }
};

export {
  renderContainer, renderFeed, renderPosts, showFeedback, handleChildLi,
};

const render = (store, i18n) => {
  renderContainer(store, i18n);
  renderFeed(store, i18n);
  renderPosts(store, i18n);
  showFeedback(store, i18n);
  handleChildLi(store, i18n);

  if (store.isLoading === 'isLoading') {
    const btn = document.querySelector('.btn-primary');
    if (store.isLoading === true) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  }
};

export default render;
