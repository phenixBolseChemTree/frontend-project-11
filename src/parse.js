const parser = (dataStr) => {
  const domParser = new DOMParser();
  const data = domParser.parseFromString(dataStr, 'application/xml');
  const errorNode = data.querySelector('parsererror');

  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParsingError = true;
    throw error;
  }

  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const posts = [...data.querySelectorAll('item')].map((nodeItem) => ({
    title: nodeItem.querySelector('title').textContent,
    description: nodeItem.querySelector('description').textContent,
    link: nodeItem.querySelector('link').textContent,
  }));
  return { title, description, posts };
};

export default parser;
