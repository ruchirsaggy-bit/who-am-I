const dialog = document.querySelector('.setup-dialog');
const game = document.querySelector('.game-screen');
const page = document.querySelectorAll('body > :not(.game-screen):not(.grain)');
const questionForm = document.querySelector('.question-form');
const questionInput = document.querySelector('#question');
const answer = document.querySelector('.answer');
const voiceButton = document.querySelector('.voice-button');
const voiceStatus = document.querySelector('.voice-status');
const personas = window.PERSONAS || [];
let activeMode = 'AI Challenger';
let activePersona = personas[0];

document.querySelector('#persona-count').textContent = personas.length;

document.querySelectorAll('.mode-card').forEach((card) => {
  card.querySelector('.play-button').addEventListener('click', () => {
    activeMode = card.dataset.mode;
    document.querySelector('#dialog-title').textContent = card.dataset.mode;
    dialog.showModal();
  });
});

document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector('.start-button').addEventListener('click', () => {
  const category = document.querySelector('input[name="category"]:checked').value;
  const choices = category === 'Icons' ? personas : personas.filter((persona) => persona.category === category);
  activePersona = choices[Math.floor(Math.random() * choices.length)] || personas[0];
  dialog.close();
  page.forEach((element) => { element.hidden = true; });
  game.hidden = false;
  questionInput.focus();
  const voiceAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  voiceButton.hidden = activeMode !== 'AI Challenger';
  voiceStatus.hidden = activeMode !== 'AI Challenger';
  if (!voiceAvailable) {
    voiceButton.disabled = true;
    voiceStatus.textContent = 'Voice input is not supported by this browser. You can still type questions.';
  }
});

document.querySelector('.exit-game').addEventListener('click', () => {
  game.hidden = true;
  page.forEach((element) => { element.hidden = false; });
});

questionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = questionInput.value;
  const response = answerQuestion(question, activePersona);
  answer.querySelector('.answer-word').textContent = response.yes ? 'YES' : 'NO';
  answer.querySelector('.answer-text').textContent = response.detail;
  answer.hidden = false;
  questionInput.value = '';
  if (activeMode === 'AI Challenger' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${response.yes ? 'Yes' : 'No'}. ${response.detail}`));
  }
});

function answerQuestion(question, persona) {
  const normalized = question.toLowerCase();
  let yes = false;
  if (/alive|living/.test(normalized)) yes = persona.alive;
  else if (/woman|female|she/.test(normalized)) yes = persona.woman;
  else if (/man|male|\bhe\b/.test(normalized)) yes = !persona.woman;
  else if (/scientist|science/.test(normalized)) yes = persona.scientist;
  else if (/artist|painter|writer|singer/.test(normalized)) yes = persona.artist;
  else if (/before 1900|19th century|before the twentieth/.test(normalized)) yes = persona.born < 1900;
  else if (/after 1900|20th century|21st century/.test(normalized)) yes = persona.born >= 1900;
  else if (/is it|are you/.test(normalized)) yes = normalized.includes(persona.name.toLowerCase());
  return { yes, detail: yes ? 'That describes your mystery person.' : 'That does not describe your mystery person.' };
}

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.addEventListener('start', () => {
    voiceButton.setAttribute('aria-pressed', 'true');
    voiceStatus.textContent = 'Listening… ask a yes-or-no question.';
  });
  recognition.addEventListener('result', (event) => {
    questionInput.value = event.results[0][0].transcript;
    voiceStatus.textContent = `Heard: “${questionInput.value}”`;
    questionForm.requestSubmit();
  });
  recognition.addEventListener('end', () => voiceButton.setAttribute('aria-pressed', 'false'));
  recognition.addEventListener('error', () => { voiceStatus.textContent = 'I could not hear that. Please try again or type your question.'; });
  voiceButton.addEventListener('click', () => recognition.start());
}

document.querySelectorAll('.suggestions button').forEach((button) => {
  button.addEventListener('click', () => {
    questionInput.value = button.textContent;
    questionInput.focus();
  });
});

document.querySelector('.guess-button').addEventListener('click', () => {
  questionInput.value = 'Is it ';
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
