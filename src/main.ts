import * as core from '@actions/core'
import {wait} from './wait'
import { getDirectoryTree } from './directory-tree';

async function run(): Promise<void> {
  try {
    const siteName = core.getInput('siteName', { required: true });
    const directoryTree = getDirectoryTree(localDirectory, homePageTitle);
    const rootDefinition: SiteDefinition = {};

    const home = getSiteDefinition(directoryTree, rootDefinition, workingDirectory);

    let outputPath = '';

    if (workingDirectory) {
      fs.ensureDirSync(workingDirectory);
      outputPath = `${workingDirectory}/`;
    }

    fs.writeFileSync(`${outputPath}site.yaml`, JSON.stringify({ spaceKey, home }));

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
