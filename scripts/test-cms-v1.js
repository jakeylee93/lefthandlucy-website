const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const requiredFiles = [
  'app/login/page.tsx',
  'app/api/cms/login/route.ts',
  'app/api/cms/logout/route.ts',
  'app/api/cms/session/route.ts',
  'app/api/cms/content/route.ts',
  'app/api/cms/revisions/route.ts',
  'app/api/cms/restore/route.ts',
  'components/cms/AdminBar.tsx',
  'components/cms/EditableText.tsx',
  'components/cms/CmsProvider.tsx',
  'components/cms/RevisionPanel.tsx',
  'lib/cms/auth.ts',
  'lib/cms/content-defaults.ts',
  'lib/cms/storage.ts',
  'lib/cms/types.ts',
];

for (const rel of requiredFiles) {
  assert(fs.existsSync(path.join(root, rel)), `Missing CMS V1 file: ${rel}`);
}

const auth = read('lib/cms/auth.ts');
assert(auth.includes('ADMIN_PASSWORD'), 'auth must read ADMIN_PASSWORD');
assert(auth.includes('createHmac'), 'auth must sign sessions');
assert(auth.includes('httpOnly'), 'session cookie must be httpOnly');
assert(auth.includes('sameSite'), 'session cookie must set sameSite');
assert(!auth.includes('password === "'), 'must not hardcode admin password');

const storage = read('lib/cms/storage.ts');
assert(storage.includes('BLOB_READ_WRITE_TOKEN'), 'storage must support Vercel Blob env');
assert(storage.includes('KV_REST_API_URL'), 'storage must keep Vercel KV/Upstash fallback support');
assert(storage.includes('KV_REST_API_TOKEN'), 'storage must keep Vercel KV token fallback support');
assert(storage.includes('createRevision'), 'storage must create revisions');
assert(storage.includes('restoreContentRevision'), 'storage must restore revisions');
assert(storage.includes('CMS storage is not configured'), 'storage must clearly block writes without durable storage');

const defaults = read('lib/cms/content-defaults.ts');
for (const key of [
  'home.hero.title',
  'home.hero.intro',
  'home.services.title',
  'home.about.title1',
  'home.contact.title',
  'home.footer.rights',
]) {
  assert(defaults.includes(key), `Missing default content key ${key}`);
}

const contentRoute = read('app/api/cms/content/route.ts');
assert(contentRoute.includes('requireAdmin'), 'content write API must require admin');
assert(contentRoute.includes('upsertContent'), 'content write API must persist content');

const restoreRoute = read('app/api/cms/restore/route.ts');
assert(restoreRoute.includes('requireAdmin'), 'restore API must require admin');
assert(restoreRoute.includes('restoreContentRevision'), 'restore API must persist restored content');

const page = read('app/page.tsx');
assert(page.includes('<CmsProvider>'), 'homepage must mount CMS provider');
assert(page.includes('<AdminBar />'), 'homepage must render admin bar');
assert(page.includes('<EditableText'), 'homepage must wrap visible text with EditableText');
assert(page.includes("cmsText('home.hero.title'"), 'hero title must render via CMS text helper');

console.log('CMS V1 structural checks passed.');
