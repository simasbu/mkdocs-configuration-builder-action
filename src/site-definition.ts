import { dir } from 'console';
import { DirectoryTree } from 'directory-tree';
import { replaceUnderscoresWithSpaces } from './utils';

export interface MkDocs {
  siteName: string;
  nav?: NavItem[];
  plugins: string[];
}

export interface NavItem {
  name?: string;
  uri?: string;
  children?: NavItem[];
}

/**
 * Generates the Site Definition object which will be consumed by the Confluence.
 * @param {DirectoryTree} directoryTree Directory tree object that needs to be mapped to the Site Definition object.
 * @param {SiteDefinition} siteDefinition Initial site definition.
 * @param {string} workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
export function getMkDocs(
  directoryTree: DirectoryTree,
  siteName: string,
  plugins: string[] = []
): MkDocs {
  let navItems: NavItem[] | undefined = [];

  if (directoryTree.children != undefined) {
    navItems = getNavItems(directoryTree, {}).children;
  }
  return { siteName, plugins, nav: navItems };
}

/**
 * Returns the list of site definition entities that may be found in the provided directory tree.
 * If no entities are found returns `undefined`.
 * @param directoryTree The directory tree where the child entities will be searched for.
 * @param workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
function getNavItems(directoryTree: DirectoryTree, navItem: NavItem): NavItem {
  if (directoryTree.children) {
    const children = directoryTree.children
      .filter(({ type }) => type === 'directory')
      .filter(({ name }) => name !== 'attachments')
      .map(child => getNavItems(child, {} as NavItem));

    navItem.children = children;
    navItem.name = directoryTree.name;
  } else {
    navItem.uri = directoryTree.path;
  }

  return navItem;
}

/**
 * Returns the uri for the the provided directory path. Uri will always have a `README.md` at the end.
 * @param directoryPath Directory path that needs to be converted to a uri.
 * @param workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
function getUri(directoryPath: string, workingDirectory: string): string {
  if (directoryPath.startsWith(workingDirectory)) {
    const uri = `${substringWorkingDirectory(directoryPath, workingDirectory)}/README.md`;
    return uri.startsWith('/') ? uri.substring(1, uri.length) : uri;
  } else {
    return `${directoryPath}/README.md`;
  }
}

/**
 * Cuts the working directory path from the provided directory path and returns the result string.
 * @param directoryPath Directory path from which the working directory path should be removed.
 * @param workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
function substringWorkingDirectory(directoryPath: string, workingDirectory: string): string {
  if (directoryPath.startsWith(workingDirectory)) {
    const newPath = directoryPath.substr(workingDirectory.length, directoryPath.length);
    return newPath.startsWith('/') ? newPath.substring(1, newPath.length) : newPath;
  } else {
    return directoryPath;
  }
}
