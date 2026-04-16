import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Menu } from "../models/Menu";
import { buildMenuTree } from "../utils/treeHelper";
import { Like } from "typeorm";

const menuRepository = AppDataSource.getRepository(Menu);

export const getAllMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const menus = await menuRepository.find({ relations: ["parent"] });
    const tree = buildMenuTree(menus);
    res.json(tree);
  } catch (error) {
    console.error("Get all menus error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { label, route, parent_id, sort_order } = req.body;

    const menu = menuRepository.create({
      label,
      route,
      sort_order: sort_order || 0,
    });

    if (parent_id) {
      const parent = await menuRepository.findOne({ where: { id: parent_id } });
      if (!parent) {
        res.status(404).json({ message: "Parent menu not found" });
        return;
      }
      menu.parent = parent;
    }

    const savedMenu = await menuRepository.save(menu);

    if (savedMenu.parent) {
      const parentPath = savedMenu.parent.path ? `${savedMenu.parent.path}.` : "";
      savedMenu.path = `${parentPath}${savedMenu.id}`;
    } else {
      savedMenu.path = savedMenu.id;
    }

    await menuRepository.save(savedMenu);

    res.status(201).json(savedMenu);
  } catch (error) {
    console.error("Create menu error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { label, route, parent_id, sort_order } = req.body;

    const menuId = id as string;
    const menu = await menuRepository.findOne({ where: { id: menuId }, relations: ["parent"] });
    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    const oldPath = menu.path;
    let pathChanged = false;

    if (label) menu.label = label;
    if (route) menu.route = route;
    if (sort_order !== undefined) menu.sort_order = sort_order;

    if (parent_id !== undefined && (!menu.parent || menu.parent.id !== parent_id)) {
      if (parent_id === null) {
        menu.parent = null as any;
        menu.path = menu.id;
      } else {
        const newParent = await menuRepository.findOne({ where: { id: parent_id } });
        if (!newParent) {
          res.status(404).json({ message: "New parent menu not found" });
          return;
        }
        menu.parent = newParent;
        const parentPath = newParent.path ? `${newParent.path}.` : "";
        menu.path = `${parentPath}${menu.id}`;
      }
      pathChanged = true;
    }

    const updatedMenu = await menuRepository.save(menu);

    if (pathChanged && oldPath) {
      const newPath = updatedMenu.path;
      const descendants = await menuRepository.find({
        where: { path: Like(`${oldPath}.%`) },
      });

      for (const descendant of descendants) {
        descendant.path = descendant.path.replace(oldPath, newPath);
        await menuRepository.save(descendant);
      }
    }

    res.json(updatedMenu);
  } catch (error) {
    console.error("Update menu error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const menuId = id as string;
    const menu = await menuRepository.findOne({ where: { id: menuId } });

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    const descendants = await menuRepository.find({
      where: [{ id: menuId }, { path: Like(`${menu.path}.%`) }],
    });

    await menuRepository.remove(descendants);

    res.json({ message: "Menu and its children deleted successfully" });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
