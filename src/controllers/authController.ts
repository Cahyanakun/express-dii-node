import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buildMenuTree } from "../utils/treeHelper";

import { BlacklistedToken } from "../models/BlacklistedToken";

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const blacklistRepository = AppDataSource.getRepository(BlacklistedToken);

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

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.json({ message: "Logout successful." });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.decode(token) as any;
    
    const blacklisted = blacklistRepository.create({
      token,
      expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : undefined
    });

    await blacklistRepository.save(blacklisted);

    res.json({ message: "Logout successful. Token invalidated." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
