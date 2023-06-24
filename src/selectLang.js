const selectLang = () => {
  const select = document.querySelector('#languageSelect');
  select.addEventListener('change', () => {
    const lang = select.value;
    location.replace(`${window.location.pathname}#${lang}`);
    select.value = lang;
    location.reload();
  });
};

export default selectLang;
