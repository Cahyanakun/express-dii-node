import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buildMenuTree } from "../utils/treeHelper";

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);

/**
 * Helper to generate standardized auth response once a role is determined
 */
const generateAuthResponse = (user: User, role: Role) => {
  const menuLabels = role.menus.map((menu) => menu.label);
  const token = jwt.sign(
    {
      userId: user.id,
      activeRoleName: role.role_name,
      menus: menuLabels,
    },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1d" }
  );

  const menuTree = buildMenuTree(role.menus);

  return {
    message: "Login successful.",
    token,
    activeRole: role.role_name,
    menus: menuTree,
  };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await userRepository.findOne({
      where: { username },
      relations: ["roles"],
      select: ["id", "username", "password", "email"],
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // AUTO-SELECT ROLE for single-role users
    if (user.roles.length === 1) {
      const selectedRole = await roleRepository.findOne({
        where: { id: user.roles[0].id },
        relations: ["menus", "menus.parent"],
      });

      if (selectedRole) {
        res.json(generateAuthResponse(user, selectedRole));
        return;
      }
    }

    // MULTI-ROLE: Return list for selection
    const roles = user.roles.map((role) => ({
      id: role.id,
      role_name: role.role_name,
      description: role.description,
    }));

    res.json({
      message: "Login successful. Please select a role.",
      userId: user.id,
      roles,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const selectRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hasRole = user.roles.some((role) => role.id === roleId);
    if (!hasRole) {
      res.status(403).json({ message: "User does not have this role" });
      return;
    }

    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["menus", "menus.parent"],
    });

    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    res.json(generateAuthResponse(user, role));
  } catch (error) {
    console.error("Select role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
