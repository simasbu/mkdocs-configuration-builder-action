import * as core from '@actions/core';
import { wait } from './wait';
import { getDirectoryTree } from './directory-tree';
import { getMkDocs } from './site-definition';

async function run(): Promise<void> {
  try {
    const siteName = core.getInput('siteName', { required: true });
    const directoryTree = getDirectoryTree('src');
    const mkDocs = getMkDocs(directoryTree, siteName, ['techdocs-core']);
    console.log('POOP', mkDocs);

    // transform the `mkDocs` into YAML
    // fs.writeFileSync(`mkdocs.yaml`, JSON.stringify({ spaceKey, home }));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
