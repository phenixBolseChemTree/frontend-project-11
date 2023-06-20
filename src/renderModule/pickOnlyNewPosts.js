const pickOnlyNewPosts = (posts, lastDateNumber) => {
  const newPosts = posts.filter((post) => {
    if (new Date(post.pubDate) > lastDateNumber) {
      return true;
    }
    return false;
  });
  return newPosts;
};

export default pickOnlyNewPosts;
