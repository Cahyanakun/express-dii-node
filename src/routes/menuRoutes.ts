import { Router } from "express";
import { getAllMenus, createMenu, updateMenu, deleteMenu } from "../controllers/menuController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu Management CRUD
 */

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Get all menus as a tree structure
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Successfully retrieved menu tree
 */
router.get("/", getAllMenus);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - route
 *             properties:
 *               label:
 *                 type: string
 *               route:
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Menu created successfully
 */
router.post("/", verifyToken, createMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update an existing menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               route:
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Menu updated successfully
 */
router.put("/:id", verifyToken, updateMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete a menu and its descendants
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 */
router.delete("/:id", verifyToken, deleteMenu);

export default router;
