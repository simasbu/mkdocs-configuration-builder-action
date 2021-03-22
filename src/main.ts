import * as core from '@actions/core';
import { wait } from './wait';
import { getDirectoryTree } from './directory-tree';
import { substringWorkingDirectory, getMkDocs } from './site-definition';
import yaml from 'js-yaml';
import * as fs from 'fs';
import { mkdir } from 'fs';

async function run(): Promise<void> {
  try {
    // const siteName = core.getInput('siteName', { required: true });
    const siteName = 'Poop';
    const docsFolder = 'src';
    const directoryTree = getDirectoryTree(docsFolder);
    const newTree = directoryTree.children?.map(c => {
      c.path = substringWorkingDirectory(c.path, docsFolder);
      return c;
    });
    console.log('newTree', JSON.stringify(newTree));

    const mkDocs = getMkDocs(directoryTree, siteName, ['techdocs-core'], docsFolder);

    // mkDocs.nav?.map(c=>{
    //   [c.name]: c.uri
    // })

    let yamlStr = yaml.dump({
      nav: [
        {
          someyhin: null,
        },
        'sefsfs',
      ],
    });
    fs.writeFileSync('data-out.yaml', yamlStr, 'utf8');

    //   nav:
    // - 'hey': hey/README.md
    // - somepage:
    //   - somepage/README.md
    //   - child:
    //     - somepage/child/README.md
    //     - grand: somepage/child/grand/README.md

    // transform the `mkDocs` into YAML
    // fs.writeFileSync(`mkdocs.yaml`, JSON.stringify({ spaceKey, home }));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
