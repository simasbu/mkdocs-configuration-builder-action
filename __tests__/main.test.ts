import { strict as assert } from 'assert';
import * as cp from 'child_process';
import * as path from 'path';
import * as process from 'process';
import { MkDocsYaml, transform } from '../src/definition-mapper';
import { getDirectoryTree } from '../src/directory-tree';
import { getMkDocs, MkDocs } from '../src/mkdocs-definition';

test('success flow', () => {
  process.env['INPUT_SITENAME'] = 'my-service';
  process.env['INPUT_DOCSFOLDER'] = '__tests__/docs';
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };
  console.log(cp.execFileSync(np, [ip], options).toString());
});

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
              { name: 'README copy', uri: 'somepage_with_underscore/child/grand/README copy.md' },
              { name: 'grand', uri: 'somepage_with_underscore/child/grand/README.md' },
              { uri: 'somepage_with_underscore/child/README.md' },
            ],
            name: 'child',
          },
          { name: 'README copy', uri: 'somepage_with_underscore/README copy.md' },
          { uri: 'somepage_with_underscore/README.md' },
        ],
        name: 'somepage with underscore',
      },
    ],
  };
  assert.deepEqual(expectedMkDocs, actualMkDocs);
});

test('generates correct mkdocs object', () => {
  const directoryTree = getDirectoryTree('__tests__/docs');
  const actualMkDocs = getMkDocs(directoryTree, 'site name', ['techdocs-core'], '__tests__/docs');
  const transformed = transform(actualMkDocs);
  const expectedMkDocs: MkDocsYaml = {
    siteName: 'site name',
    plugins: ['techdocs-core'],
    nav: [
      { hey: 'hey/README.md' },
      {
        'somepage with underscore': [
          {
            child: [
              { 'README copy': 'somepage_with_underscore/child/grand/README copy.md' },
              { grand: 'somepage_with_underscore/child/grand/README.md' },
              'somepage_with_underscore/child/README.md',
            ],
          },
          { 'README copy': 'somepage_with_underscore/README copy.md' },
          'somepage_with_underscore/README.md',
        ],
      },
    ],
  };
  assert.deepEqual(transformed, expectedMkDocs);
});
