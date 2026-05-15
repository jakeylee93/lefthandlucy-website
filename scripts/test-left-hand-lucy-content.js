const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'app', 'page.tsx'), 'utf8');
const translations = fs.readFileSync(path.join(root, 'app', 'translations.ts'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app', 'layout.tsx'), 'utf8');
const combined = `${page}\n${translations}\n${layout}`;

function mustInclude(needle) {
  if (!combined.includes(needle)) {
    throw new Error(`Missing required content: ${needle}`);
  }
}

function mustNotInclude(needle) {
  if (combined.includes(needle)) {
    throw new Error(`Forbidden placeholder/outdated content remains: ${needle}`);
  }
}

[
  "A steady hand for life's busy corners",
  'IN PERSON. VIRTUAL. FLEXIBLE.',
  'Meet Lucy',
  'Welcome to Left Hand Lucy',
  "I'm glad you found me!",
  'Another string to your bow',
  'experienced multilingual Executive Assistant',
  'I help people learn, connect and get things done',
  'Project Support',
  'Let Lucy take care of the to-do list',
  'Email & inbox management',
  'English Lessons',
  'Whether you want to improve conversation, writing or professional communication',
  'Events & Experiences',
  'Madrid experiences & local recommendations',
  "Let's talk?",
  "Let's talk about how I can help",
  'Usually 1-2 working days',
  'Executive Assistant',
  'Multilingual',
  'Qualified Teacher',
  'Event Planner',
  'id="meet-lucy"',
].forEach(mustInclude);

[
  'https://wa.me/message',
  "'nav.faq'",
  'What I Do',
  "Let's talk about what you need",
  'Tell me a bit about what you need',
].forEach(mustNotInclude);

console.log('Left Hand Lucy content checks passed.');
