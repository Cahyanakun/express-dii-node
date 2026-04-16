import { Router } from "express";
import { login, selectRole, logout } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Role Selection
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns user ID and available roles.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/select-role:
 *   post:
 *     summary: Select Active Role
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               roleId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Role selected successfully, returns JWT token and Menu Tree.
 *       403:
 *         description: User does not have this role.
 *       404:
 *         description: User or Role not found.
 */
router.post("/select-role", selectRole);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful.
 */
router.post("/logout", logout);

export default router;
