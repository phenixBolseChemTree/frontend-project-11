const pickOnlyNewPosts = (posts, lastPubDate) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > new Date(lastPubDate)) {
      return true;
    }
    return false;
  });
  return newPosts;
};

const pickOnlyOldPosts = (posts, lastPubDate) => {
  const oldPosts = posts.filter((post) => {
    if (new Date(post.pubDate) <= new Date(lastPubDate)) {
      return true;
    }
    return false;
  });
  return oldPosts;
};

export { pickOnlyNewPosts, pickOnlyOldPosts };
