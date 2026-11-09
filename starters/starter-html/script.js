let count = 0;

document.getElementById('counter-btn').addEventListener('click', () => {
  count++;
  document.getElementById('count').textContent = count;
});
