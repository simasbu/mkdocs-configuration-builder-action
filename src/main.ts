import * as core from '@actions/core';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { transform } from './definition-mapper';
import { getDirectoryTree } from './directory-tree';
import { getMkDocs } from './mkdocs-definition';

async function run(): Promise<void> {
  try {
    const siteName = core.getInput('siteName', { required: true });
    const docsFolder = core.getInput('docsFolder', { required: true });
    const directoryTree = getDirectoryTree(docsFolder);
    const mkDocs = getMkDocs(directoryTree, siteName, ['techdocs-core'], docsFolder);
    const transformed = transform(mkDocs);
    const yamlStr = yaml.dump(transformed);
    fs.writeFileSync('mkdocs.yaml', yamlStr, 'utf8');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
