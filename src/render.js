const render = (link) => {
  const containerList = document.querySelector('.container-list');
  const existingElement = Array.from(containerList.children).find((element) => element.querySelector('p').textContent === `volid: ${link}`);

  if (!existingElement) {
    const div = document.createElement('div');
    div.classList.add('container', 'w-100');

    const innerDiv = document.createElement('div');
    innerDiv.classList.add('bg-secondary', 'rounded', 'text-info', 'p-4', 'mb-4');

    const p = document.createElement('p');
    p.classList.add('h2');
    p.textContent = link;

    innerDiv.appendChild(p);
    div.appendChild(innerDiv);
    containerList.appendChild(div);
  }
};

export default render;
