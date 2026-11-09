// Page behaviour. Loaded with `defer`, so the DOM is ready when this runs.
const counterButton = document.getElementById('counter-btn');

if (counterButton) {
  let count = 0;
  const output = document.getElementById('count');
  counterButton.addEventListener('click', () => {
    count += 1;
    output.textContent = count;
  });
}
