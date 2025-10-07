import { Router } from "express";
import { fileController } from "../controllers/fileController";
import { validate } from "../middlewares/validation.middleware";
import {
  createFileSchema,
  updateFileSchema,
  fileSearchSchema,
  fileIdParamsSchema,
  folderIdParamsSchema,
  clientIdParamsSchema,
} from "../validations/file.validation";
import { paginationSchema } from "../validations/note.validation";
import multer from "multer";
import {
  authenticate,
  requireManagerOrSuperAdmin,
} from "../middlewares/auth.middleware";
const upload = multer();

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Create a new file record
 *     description: Create a new file record in the system (file upload handled separately)
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - folderId
 *             properties:
 *               fileName:
 *                 type: string
 *                 maxLength: 255
 *                 example: contract.pdf
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Client signed contract document
 *               folderId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: File record created successfully
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
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Folder not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", upload.single("file"), fileController.createFile);

/**
 * @swagger
 * /files/folder/{folderId}:
 *   get:
 *     summary: Get files by folder
 *     description: Retrieve paginated list of files for a specific folder
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the folder
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
 *           default: uploadedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *                         $ref: '#/components/schemas/File'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Folder not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/folder/:folderId",
  validate(folderIdParamsSchema),
  validate(paginationSchema),
  fileController.getFilesByFolderId
);

/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get file by ID
 *     description: Retrieve a specific file by its ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
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
 *                   $ref: '#/components/schemas/File'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", validate(fileIdParamsSchema), fileController.getFileById);

/**
 * @swagger
 * /files/{id}:
 *   put:
 *     summary: Update a file
 *     description: Update file information (name, description)
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 maxLength: 255
 *                 example: updated-contract.pdf
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated contract document
 *     responses:
 *       200:
 *         description: File updated successfully
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
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  "/:id",
  validate(fileIdParamsSchema),
  validate(updateFileSchema),
  requireManagerOrSuperAdmin,
  fileController.updateFile
);

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     summary: Delete a file
 *     description: Delete a specific file by its ID (Note: This only deletes the database record, not the physical file)
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:id",
  requireManagerOrSuperAdmin,
  validate(fileIdParamsSchema),
  fileController.deleteFile
);

/**
 * @swagger
 * /files/client/{clientId}/search:
 *   get:
 *     summary: Search files
 *     description: Search files within a client's files by name or description
 *     tags: [Files]
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
 *           default: uploadedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *                         $ref: '#/components/schemas/File'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/client/:clientId/search",
  validate(clientIdParamsSchema),
  validate(fileSearchSchema),
  fileController.searchFiles
);

/**
 * @swagger
 * /files/client/{clientId}/statistics:
 *   get:
 *     summary: Get file statistics
 *     description: Retrieve statistics about files for a specific client
 *     tags: [Files]
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
 *                     totalFiles:
 *                       type: integer
 *                       example: 15
 *                     byType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mimeType:
 *                             type: string
 *                             example: application/pdf
 *                           _count:
 *                             type: object
 *                             properties:
 *                               mimeType:
 *                                 type: integer
 *                                 example: 8
 *                     totalSize:
 *                       type: integer
 *                       example: 15728640
 *       404:
 *         description: Client not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/client/:clientId/statistics",
  validate(clientIdParamsSchema),
  fileController.getFileStatistics
);

export default router;
