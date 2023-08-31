const parser = (dataStr) => {
  const domParser = new DOMParser();
  const data = domParser.parseFromString(dataStr, 'application/xml');
  const errorNode = data.querySelector('parsererror');

  if (errorNode) {
    throw new Error('invalidRSS');
  }

  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const postsReverse = [...data.querySelectorAll('item')].map((nodeItem) => ({
    title: nodeItem.querySelector('title').textContent,
    description: nodeItem.querySelector('description').textContent,
    link: nodeItem.querySelector('link').textContent,
  }));
  const posts = postsReverse;
  return { title, description, posts };
};

export default parser;
