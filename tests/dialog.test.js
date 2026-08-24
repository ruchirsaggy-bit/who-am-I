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
    classList: { values: new Set(), add(value) { this.values.add(value); }, remove(value) { this.values.delete(value); }, contains(value) { return this.values.has(value); } },
    addEventListener(type, callback) { listeners[type] = callback; },
    dispatch(type, event = {}) { listeners[type]?.({ target: this, currentTarget: this, preventDefault() {}, ...event }); },
    setAttribute(name, value) { attributes.set(name, value); if (name === 'open') this.open = true; },
    removeAttribute(name) { attributes.delete(name); if (name === 'open') this.open = false; },
    hasAttribute(name) { return attributes.has(name); },
    querySelector() { return this.button; },
    focus() {}
  };
}

const dialog = element();
const card = element();
card.dataset.mode = 'AI Challenger';
card.button = element();

const selectors = new Map();
for (const selector of [
  '.setup-dialog', '.setup-overlay', '.game-screen', '.question-form', '#question', '.answer',
  '.voice-button', '.voice-status', '.retry-permission', '#persona-count',
  '#dialog-title', '.close-dialog', '.start-button', '.exit-game',
  '.guess-button', '.sound-button'
]) selectors.set(selector, element());
selectors.set('.setup-dialog', dialog);
const overlay = selectors.get('.setup-overlay');
overlay.hidden = true;

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
assert.equal(overlay.hidden, false, 'Play solo should reveal the setup overlay');
assert.equal(selectors.get('#dialog-title').textContent, 'AI Challenger');
console.log('Play solo opens the single setup overlay');
