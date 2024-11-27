export function incrementRenderCount() {
  const renderCountElement = document.querySelector("#renderCount");
  renderCountElement.textContent = `${Number(renderCountElement.textContent) + 1}`;
}
