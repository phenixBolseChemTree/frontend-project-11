const parser = (response) => {
  const domParser = new DOMParser();
  const parseData = domParser.parseFromString(response.data.contents, 'application/xml');
  if (parseData.querySelector('parsererror')) {
    return 'invalidRSS';
  }
  return parseData;
};

const pickOnlyNewPosts = (posts, lastDateNumber) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > lastDateNumber) {
      return true;
    }
    return false;
  });
  return newPosts;
};

const parseData = (data) => [...data.querySelectorAll('item')].map((nodeItem) => ({
  title: nodeItem.querySelector('title').innerHTML,
  description: nodeItem.querySelector('description').innerHTML,
  link: nodeItem.querySelector('link').innerHTML,
  pubDate: nodeItem.querySelector('pubDate').innerHTML,
}));

export { parser, pickOnlyNewPosts, parseData };
