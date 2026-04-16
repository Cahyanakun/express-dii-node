import { Menu } from "../models/Menu";

export interface MenuTree extends Omit<Menu, 'parent' | 'children'> {
  children: MenuTree[];
}

/**
 * Transforms a flat array of Menu entities into a nested tree structure.
 * @param menus Flat array of menus
 * @param parentId ID of the parent to filter by (null for root)
 * @returns Sorted nested menu tree
 */
export const buildMenuTree = (menus: Menu[], parentId: string | null = null): MenuTree[] => {
  return menus
    .filter((menu) => {
      const menuParentId = menu.parent ? menu.parent.id : null;
      return menuParentId === parentId;
    })
    .map((menu) => {
      const { parent, children, ...menuData } = menu;
      return {
        ...menuData,
        children: buildMenuTree(menus, menu.id),
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);
};
