const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element() {
  const listeners = {};
  const attributes = new Map();
  return {
    hidden: false,
    open: false,
    dataset: {},
    style: {},
    textContent: '',
    classList: { add() {}, remove() {} },
    addEventListener(type, callback) { listeners[type] = callback; },
    dispatch(type, event = {}) { listeners[type]?.({ target: this, currentTarget: this, preventDefault() {}, ...event }); },
    setAttribute(name, value) { attributes.set(name, value); if (name === 'open') this.open = true; },
    removeAttribute(name) { attributes.delete(name); if (name === 'open') this.open = false; },
    hasAttribute(name) { return attributes.has(name); },
    querySelector() { return this.button; },
    focus() {}
  };
}

const dialog = element(); // Deliberately has no showModal(), matching an older webview.
const card = element();
card.dataset.mode = 'AI Challenger';
card.button = element();

const selectors = new Map();
for (const selector of [
  '.setup-dialog', '.game-screen', '.question-form', '#question', '.answer',
  '.voice-button', '.voice-status', '.retry-permission', '#persona-count',
  '#dialog-title', '.close-dialog', '.start-button', '.exit-game',
  '.guess-button', '.sound-button'
]) selectors.set(selector, element());
selectors.set('.setup-dialog', dialog);

const document = {
  body: element(),
  querySelector(selector) { return selectors.get(selector); },
  querySelectorAll(selector) {
    if (selector === '.mode-card') return [card];
    return [];
  },
  addEventListener() {}
};

const window = { PERSONAS: [{ name: 'Test Persona', category: 'Icons' }] };
vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), { document, window, navigator: {} });

card.button.dispatch('click');
assert.equal(dialog.open, true, 'Play solo should open the setup dialog without showModal support');
assert.equal(selectors.get('#dialog-title').textContent, 'AI Challenger');
console.log('Play solo dialog fallback passed');
