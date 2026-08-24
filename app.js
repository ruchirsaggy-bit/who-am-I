const dialog = document.querySelector('.setup-dialog');
const game = document.querySelector('.game-screen');
const page = document.querySelectorAll('body > :not(.game-screen):not(.grain)');
const questionForm = document.querySelector('.question-form');
const questionInput = document.querySelector('#question');
const answer = document.querySelector('.answer');
const voiceButton = document.querySelector('.voice-button');
const voiceStatus = document.querySelector('.voice-status');
const retryPermissionButton = document.querySelector('.retry-permission');
const personas = window.PERSONAS || [];
let activeMode = 'AI Challenger';
let activePersona = personas[0];
let recognition;
let isListening = false;
let microphonePermission = 'prompt';

document.querySelector('#persona-count').textContent = personas.length;

function openSetupDialog() {
  // Older embedded browsers do not implement HTMLDialogElement.showModal().
  // Keeping an explicit fallback makes the mode cards usable in those clients.
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
    return;
  }
  dialog.setAttribute('open', '');
  dialog.classList.add('dialog-fallback');
  document.body.classList.add('dialog-open');
}

function closeSetupDialog() {
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
  dialog.classList.remove('dialog-fallback');
  document.body.classList.remove('dialog-open');
}

document.querySelectorAll('.mode-card').forEach((card) => {
  card.querySelector('.play-button').addEventListener('click', () => {
    activeMode = card.dataset.mode;
    document.querySelector('#dialog-title').textContent = card.dataset.mode;
    openSetupDialog();
  });
});

document.querySelector('.close-dialog').addEventListener('click', closeSetupDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeSetupDialog();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialog.hasAttribute('open')) closeSetupDialog();
const personas = window.PERSONAS || [];
let activeMode = 'AI Challenger';
let activePersona = personas[0];

document.querySelector('#persona-count').textContent = personas.length;

document.querySelectorAll('.mode-card').forEach((card) => {
  card.querySelector('.play-button').addEventListener('click', () => {
    activeMode = card.dataset.mode;

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
  const category = document.querySelector('input[name="category"]:checked').value;
  const choices = category === 'Icons' ? personas : personas.filter((persona) => persona.category === category);
  activePersona = choices[Math.floor(Math.random() * choices.length)] || personas[0];
  closeSetupDialog();
  dialog.close();
  page.forEach((element) => { element.hidden = true; });
  game.hidden = false;
  questionInput.focus();
  const voiceAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  voiceButton.hidden = activeMode !== 'AI Challenger';
  voiceStatus.hidden = activeMode !== 'AI Challenger';
  if (!voiceAvailable) {
    voiceButton.disabled = true;
    setVoiceStatus('unsupported', 'Voice input is not supported by this browser. Type your question above instead.');
  } else {
    inspectMicrophonePermission();
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
  if (activeMode === 'AI Challenger') speakAnswer(response);
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

function setVoiceStatus(state, message) {
  voiceButton.dataset.state = state;
  voiceStatus.textContent = message;
  retryPermissionButton.hidden = state !== 'denied';
}

async function inspectMicrophonePermission() {
  if (!navigator.permissions?.query) {
    setVoiceStatus('idle', 'Tap the microphone to allow access and ask a question.');
    return;
  }
  try {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    microphonePermission = permission.state;
    updatePermissionMessage(permission.state);
    permission.addEventListener('change', () => {
      microphonePermission = permission.state;
      updatePermissionMessage(permission.state);
    });
  } catch {
    setVoiceStatus('idle', 'Tap the microphone to allow access and ask a question.');
  }
}

function updatePermissionMessage(state) {
  if (state === 'denied') setVoiceStatus('denied', 'Microphone access is blocked. Allow it in your browser settings, or type your question.');
  else if (state === 'granted') setVoiceStatus('idle', 'Microphone ready. Tap the microphone and speak.');
  else setVoiceStatus('idle', 'Tap the microphone to grant access and speak your question.');
}

async function requestMicrophoneAndListen() {
  if (isListening) {
    recognition.stop();
    return;
  }
  setVoiceStatus('requesting', 'Requesting microphone access…');
  voiceButton.disabled = true;
  try {
    if (navigator.mediaDevices?.getUserMedia && microphonePermission !== 'granted') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      microphonePermission = 'granted';
    }
    voiceButton.disabled = false;
    recognition.start();
  } catch (error) {
    voiceButton.disabled = false;
    const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
    setVoiceStatus(denied ? 'denied' : 'error', denied
      ? 'Microphone access was denied. Change your browser permission or type your question.'
      : 'The microphone is unavailable. Check that it is connected, or type your question.');
  }
}

function speakAnswer(response) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    setVoiceStatus('idle', 'Answer shown on screen. Spoken answers are not supported by this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${response.yes ? 'Yes' : 'No'}. ${response.detail}`);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.addEventListener('start', () => setVoiceStatus('speaking', 'Reading the answer aloud…'));
  utterance.addEventListener('end', () => setVoiceStatus('idle', 'Answer read aloud. Tap the microphone to ask another question.'));
  utterance.addEventListener('error', () => setVoiceStatus('error', 'The answer is shown, but could not be read aloud. You can keep typing questions.'));
  window.speechSynthesis.speak(utterance);
}

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('start', () => {
    isListening = true;
    voiceButton.setAttribute('aria-pressed', 'true');
    voiceButton.setAttribute('aria-label', 'Stop listening');
    setVoiceStatus('listening', 'Listening… ask a yes-or-no question. Tap again to stop.');
  });
  recognition.addEventListener('result', (event) => {
    questionInput.value = event.results[0][0].transcript;
    setVoiceStatus('processing', `Heard: “${questionInput.value}”`);
    questionForm.requestSubmit();
  });
  recognition.addEventListener('nomatch', () => setVoiceStatus('error', 'I could not understand that. Tap the microphone to try again, or type your question.'));
  recognition.addEventListener('end', () => {
    isListening = false;
    voiceButton.setAttribute('aria-pressed', 'false');
    voiceButton.setAttribute('aria-label', 'Start voice question');
    if (voiceButton.dataset.state === 'listening') setVoiceStatus('idle', 'Listening stopped. Tap the microphone to try again.');
  });
  recognition.addEventListener('error', (event) => {
    const denied = event.error === 'not-allowed' || event.error === 'service-not-allowed';
    setVoiceStatus(denied ? 'denied' : 'error', denied
      ? 'Microphone access is blocked. Allow it in browser settings, or type your question.'
      : 'I could not hear that. Tap the microphone to retry, or type your question.');
  });
  voiceButton.addEventListener('click', requestMicrophoneAndListen);
  retryPermissionButton.addEventListener('click', requestMicrophoneAndListen);
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
  questionInput.value = 'Is it ';
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
