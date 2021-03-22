import { wait } from '../src/wait';
import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { getMkDocs, MkDocs } from '../src/site-definition';
import { getDirectoryTree } from '../src/directory-tree';
import { strict as assert } from 'assert';

// test('success flow', () => {
//   process.env['INPUT_SITENAME'] = 'my-service';
//   const np = process.execPath;
//   const ip = path.join(__dirname, '..', 'lib', 'main.js');
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env,
//   };
//   console.log(cp.execFileSync(np, [ip], options).toString());
// });

test('generates correct mkdocs object', () => {
  const directoryTree = getDirectoryTree('__tests__/docs');
  const actualMkDocs = getMkDocs(directoryTree, 'site name', ['techdocs-core'], '__tests__/docs');

  const expectedMkDocs: MkDocs = {
    siteName: 'site name',
    plugins: ['techdocs-core'],
    nav: [
      { name: 'hey', uri: 'hey/README.md' },
      {
        children: [
          {
            children: [
              { name: 'README copy', uri: 'somepage/child/grand/README copy.md' },
              { name: 'grand', uri: 'somepage/child/grand/README.md' },
              { uri: 'somepage/child/README.md' },
            ],
            name: 'child',
          },
          { name: 'README copy', uri: 'somepage/README copy.md' },
          { uri: 'somepage/README.md' },
        ],
        name: 'somepage',
      },
    ],
  };
  assert.deepEqual(expectedMkDocs, actualMkDocs);
});
