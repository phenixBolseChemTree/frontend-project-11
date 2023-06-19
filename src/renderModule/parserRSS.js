const parser = (response) => {
  const domParser = new DOMParser();
  return domParser.parseFromString(response.data.contents, 'application/xml');
};

export default parser;
