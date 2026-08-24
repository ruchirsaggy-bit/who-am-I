const dialog = document.querySelector('.setup-dialog');
const game = document.querySelector('.game-screen');
const page = document.querySelectorAll('body > :not(.game-screen):not(.grain)');
const questionForm = document.querySelector('.question-form');
const questionInput = document.querySelector('#question');
const answer = document.querySelector('.answer');

document.querySelectorAll('.mode-card').forEach((card) => {
  card.querySelector('.play-button').addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = card.dataset.mode;
    dialog.showModal();
  });
});

document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector('.start-button').addEventListener('click', () => {
  dialog.close();
  page.forEach((element) => { element.hidden = true; });
  game.hidden = false;
  questionInput.focus();
});

document.querySelector('.exit-game').addEventListener('click', () => {
  game.hidden = true;
  page.forEach((element) => { element.hidden = false; });
});

questionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const isNegative = /alive|woman|artist/i.test(questionInput.value);
  answer.querySelector('.answer-word').textContent = isNegative ? 'NO' : 'YES';
  answer.querySelector('.answer-text').textContent = isNegative
    ? 'That does not describe this mystery person.'
    : 'You are on the right track. Keep narrowing it down.';
  answer.hidden = false;
  questionInput.value = '';
});

document.querySelectorAll('.suggestions button').forEach((button) => {
  button.addEventListener('click', () => {
    questionInput.value = button.textContent;
    questionInput.focus();
  });
});

document.querySelector('.guess-button').addEventListener('click', () => {
  questionInput.value = 'Is it Albert Einstein?';
  questionInput.focus();
});

document.querySelectorAll('.nav-link').forEach((link, index) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    document.querySelector(index ? '#how-to' : '#play').scrollIntoView();
  });
});

document.querySelector('.sound-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!enabled));
  button.style.opacity = enabled ? '.4' : '1';
});
