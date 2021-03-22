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

  return { siteName, plugins, nav: navItems[0].children };
}

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
    navItem.name = replaceUnderscoresWithSpaces(directoryTree.name);

    const readmes = directoryTree.children
      .filter(({ type }) => type !== 'directory')
      .filter(({ extension }) => extension === mdExtension)
      .map(
        c =>
          ({
            ...(c.name !== 'README.md' && {
              name: replaceUnderscoresWithSpaces(
                c.name.substring(0, c.name.length - mdExtension.length)
              ),
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
                ? replaceUnderscoresWithSpaces(directoryTree.name)
                : replaceUnderscoresWithSpaces(
                    c.name.substring(0, c.name.length - mdExtension.length)
                  ),
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
