import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { BlacklistedToken } from "../models/BlacklistedToken";

const blacklistRepository = AppDataSource.getRepository(BlacklistedToken);

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ message: "Access denied. No token provided." });
     return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const isBlacklisted = await blacklistRepository.findOne({ where: { token } });
    if (isBlacklisted) {
      res.status(401).json({ message: "Session expired. Please login again." });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
    return;
  }
};
