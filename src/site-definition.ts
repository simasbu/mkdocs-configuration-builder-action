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
  plugins: string[] = [],
  workingDirectory: string
): MkDocs {
  let navItems: NavItem[] | undefined = [];

  if (directoryTree.children != undefined) {
    const children = getNavItems(directoryTree, {}, workingDirectory);
    const flatten = ([] as NavItem[]).concat(...children);

    navItems = flatten;
  }
  // console.log(navItems);

  return { siteName, plugins, nav: navItems[0].children };
}

/**
 * Returns the list of site definition entities that may be found in the provided directory tree.
 * If no entities are found returns `undefined`.
 * @param directoryTree The directory tree where the child entities will be searched for.
 * @param workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
function getNavItems(
  directoryTree: DirectoryTree,
  navItem: NavItem,
  workingDirectory: string
): NavItem[] {
  let navItems: NavItem[] = [];
  const mdExtension = '.md';
  if (directoryTree.children === undefined) {
    return navItems;
  }
  if (directoryTree.children && hasChildDirectories(directoryTree)) {
    const children = directoryTree.children
      .filter(({ type }) => type === 'directory')
      .filter(({ name }) => name !== 'attachments')
      .map(child => getNavItems(child, {} as NavItem, workingDirectory));

    const flatten = ([] as NavItem[]).concat(...children);

    navItem.children = flatten;
    navItem.name = directoryTree.name;

    const readmes = directoryTree.children
      .filter(({ type }) => type !== 'directory')
      .filter(({ extension }) => extension === mdExtension)
      .map(
        c =>
          ({
            ...(c.name !== 'README.md' && {
              name: c.name.substring(0, c.name.length - mdExtension.length),
            }),
            uri: substringWorkingDirectory(directoryTree.path + '/' + c.name, workingDirectory),
          } as NavItem)
      );

    navItem.children = [...navItem.children, ...readmes];

    navItems.push(navItem);
  } else {
    const readmes = directoryTree.children
      .filter(({ type }) => type !== 'directory')
      .filter(({ extension }) => extension === mdExtension)
      .map(
        c =>
          ({
            name:
              c.name == 'README.md'
                ? directoryTree.name
                : c.name.substring(0, c.name.length - mdExtension.length),
            uri: substringWorkingDirectory(directoryTree.path + '/' + c.name, workingDirectory),
          } as NavItem)
      );
    return readmes;
  }

  return navItems;
}

function hasChildDirectories(tree: DirectoryTree): boolean {
  return (
    tree.children != undefined &&
    tree.children.some(({ type, name }) => type === 'directory' && name !== 'attachments')
  );
}

/**
 * Cuts the working directory path from the provided directory path and returns the result string.
 * @param directoryPath Directory path from which the working directory path should be removed.
 * @param workingDirectory A prefix of the path that will be removed from the final uri value of each site definition entity.
 */
export function substringWorkingDirectory(directoryPath: string, workingDirectory: string): string {
  if (directoryPath.startsWith(workingDirectory)) {
    const newPath = directoryPath.substr(workingDirectory.length, directoryPath.length);
    return newPath.startsWith('/') ? newPath.substring(1, newPath.length) : newPath;
  } else {
    return directoryPath;
  }
}
