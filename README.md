# Persona

A polished, responsive prototype for a modern **Who Am I?** guessing game. Players can challenge an AI, share a device, or create an online room.

## Run locally

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

The prototype uses plain HTML, CSS, and JavaScript and has no build dependencies.

The setup screen uses the native HTML dialog where available and includes a compatibility fallback for older or embedded browsers.

## Personas and voice mode

The local knowledge base currently includes **24 personas** across icons, history, science, and the arts. The records live in `personas.js`, so more people and answer attributes can be added without changing the interface.

AI Challenger mode supports browser-native voice input and spoken answers through the Web Speech API. The interface explains microphone permission states, lets players stop or retry listening, and reads every generated answer aloud. Voice availability depends on browser support, a secure context (`https://` or localhost), and microphone permission; the labeled text field and **Ask** button always remain available as a fallback.
