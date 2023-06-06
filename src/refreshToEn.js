const refreshToEn = () => {
  const selectLang = document.querySelector('#languageSelect');
  const allLang = ['ru', 'en'];
  const hash = window.location.hash.slice(1);
  if (!allLang.includes(hash)) {
    location.href = `${window.location.pathname}#en`;
    location.reload();
  }
  selectLang.value = hash;
};

export default refreshToEn;
