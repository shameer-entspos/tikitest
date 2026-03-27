const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('tsconfig include list does not contain invalid extensions', () => {
  const tsconfig = read('tsconfig.json');
  assert.equal(tsconfig.includes('.tsxsx'), false);
});

test('middleware does not log in request path', () => {
  const middleware = read('src/middleware.ts');
  assert.equal(middleware.includes('console.log('), false);
});

test('auth route/provider file avoids any-casts', () => {
  const authFile = read('src/pages/api/auth/[...nextauth].ts');
  assert.equal(authFile.includes(' as any'), false);
});

test('tasks filtering logic extracted into dedicated module', () => {
  const taskFilterFilePath = path.join(
    repoRoot,
    'src/components/Tasks/tasks-filter.ts'
  );
  assert.equal(fs.existsSync(taskFilterFilePath), true);
});
