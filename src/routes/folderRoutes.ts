import { Router } from "express";
import { folderController } from "../controllers/folderController";
import { validate } from "../middlewares/validation.middleware";
import {
  createFolderSchema,
  updateFolderSchema,
  folderSearchSchema,
  folderIdParamsSchema,
  clientIdParamsSchema,
} from "../validations/folder.validation";
import { paginationSchema } from "../validations/note.validation";
import {
  authenticate,
  requireManagerOrSuperAdmin,
} from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /folders:
 *   post:
 *     summary: Create a new folder
 *     description: Create a new custom folder for a client. You can also include an optional description for the folder.
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - clientId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Financial Documents"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "This folder contains all financial statements and receipts for 2024."
 *               clientId:
 *                 type: integer
 *                 example: 1
 *               type:
 *                 type: string
 *                 enum: [default, custom]
 *                 default: custom
 *                 example: custom
 *     responses:
 *       201:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FolderWithClient'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", validate(createFolderSchema), folderController.createFolder);

/**
 * @swagger
 * /folders/{id}:
 *   get:
 *     summary: Get folder by ID
 *     description: Retrieve a specific folder by its ID with included files
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FolderWithFiles'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/:id",
  validate(folderIdParamsSchema),
  folderController.getFolderById
);

/**
 * @swagger
 * /folders/{id}:
 *   put:
 *     summary: Update a folder
 *     description: Update folder name or description (cannot rename default folders)
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Folder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Updated Folder Name"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated description for the folder containing 2024 contracts and invoices."
 *     responses:
 *       200:
 *         description: Folder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FolderWithClient'
 *       400:
 *         description: Cannot rename default folders or duplicate folder name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  "/:id",
  validate(folderIdParamsSchema),
  validate(updateFolderSchema),
  requireManagerOrSuperAdmin,
  folderController.updateFolder
);

/**
 * @swagger
 * /folders/{id}:
 *   delete:
 *     summary: Delete a folder
 *     description: Delete a specific folder (cannot delete default folders or folders with files)
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete default folders or folders containing files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:id",
  validate(folderIdParamsSchema),
  requireManagerOrSuperAdmin,
  folderController.deleteFolder
);

/**
 * @swagger
 * /folders/client/{clientId}/search:
 *   get:
 *     summary: Search folders
 *     description: Search folders within a client's folders by name
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FolderWithClient'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/client/:clientId/search",
  validate(clientIdParamsSchema),
  validate(folderSearchSchema),
  folderController.searchFolders
);

/**
 * @swagger
 * /folders/client/{clientId}/statistics:
 *   get:
 *     summary: Get folder statistics
 *     description: Retrieve statistics about folders for a specific client
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFolders:
 *                       type: integer
 *                       example: 8
 *                     byType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: default
 *                           _count:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: integer
 *                                 example: 5
 *                     folders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Contracts"
 *                           type:
 *                             type: string
 *                             example: "default"
 *                           fileCount:
 *                             type: integer
 *                             example: 12
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/client/:clientId/statistics",
  validate(clientIdParamsSchema),
  folderController.getFolderStatistics
);

/**
 * @swagger
 * /folders/client/{clientId}:
 *   get:
 *     summary: Get folders by client
 *     description: Retrieve paginated list of folders for a specific client
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the client
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FolderWithClient'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/client/:clientId",
  validate(clientIdParamsSchema),
  validate(paginationSchema),
  folderController.getFoldersByClientId
);

export default router;
