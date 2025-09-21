import { Router } from "express";
import { clientController } from "../controllers/clientController";
import { validate } from "../middlewares/validation.middleware";
import {
  createClientSchema,
  updateClientSchema,
  clientSearchSchema,
  clientIdParamsSchema,
} from "../validations/client.validation";
import { paginationSchema } from "../validations/note.validation";

const router = Router();

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     description: Create a new client with default folders. Case number is optional - system will generate a temporary one if not provided.
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phoneNumber
 *               - createdBy
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               createdBy:
 *                 type: string
 *                 example: "admin"
 *               caseNumber:
 *                 type: string
 *                 example: "CASE-2024-001"
 *                 description: Optional - if not provided, system generates temporary case number
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00Z"
 *               assignedLawyer:
 *                 type: string
 *                 example: "Sarah Johnson"
 *               court:
 *                 type: string
 *                 example: "Federal Court"
 *               status:
 *                 type: string
 *                 example: "Pending"
 *     responses:
 *       201:
 *         description: Client created successfully with default folders
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
 *                   $ref: '#/components/schemas/ClientWithRelations'
 *       400:
 *         description: Case number already exists or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", validate(createClientSchema), clientController.createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     description: Retrieve paginated list of clients with optional filtering
 *     tags: [Clients]
 *     parameters:
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: lawyer
 *         schema:
 *           type: string
 *         description: Filter by assigned lawyer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, case number, or lawyer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
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
 *                         $ref: '#/components/schemas/ClientWithRelations'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", validate(paginationSchema), clientController.getClients);

/**
 * @swagger
 * /clients/search:
 *   get:
 *     summary: Search clients
 *     description: Search clients with advanced filtering
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: lawyer
 *         schema:
 *           type: string
 *         description: Filter by assigned lawyer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
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
 *           default: createdAt
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
 *                         $ref: '#/components/schemas/ClientWithRelations'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/search",
  validate(clientSearchSchema),
  clientController.searchClients
);

/**
 * @swagger
 * /clients/statistics:
 *   get:
 *     summary: Get client statistics
 *     description: Retrieve statistics about clients
 *     tags: [Clients]
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
 *                     totalClients:
 *                       type: integer
 *                       example: 150
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: "Active"
 *                           _count:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: integer
 *                                 example: 100
 *                     byLawyer:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           assignedLawyer:
 *                             type: string
 *                             example: "Sarah Johnson"
 *                           _count:
 *                             type: object
 *                             properties:
 *                               assignedLawyer:
 *                                 type: integer
 *                                 example: 25
 *                     recentClients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           fullName:
 *                             type: string
 *                             example: "John Doe"
 *                           caseNumber:
 *                             type: string
 *                             example: "CASE-2024-001"
 *                           status:
 *                             type: string
 *                             example: "Pending"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/statistics", clientController.getClientStatistics);

/**
 * @swagger
 * /clients/check-case-number:
 *   get:
 *     summary: Check if case number exists
 *     description: Check if a case number is already in use
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: caseNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Case number to check
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
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Case number parameter is required
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/check-case-number", clientController.checkCaseNumberExists);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     description: Retrieve a specific client by ID with all relations (folders, notes, files)
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
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
 *                   $ref: '#/components/schemas/ClientWithRelations'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/:id",
  validate(clientIdParamsSchema),
  clientController.getClientById
);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update a client
 *     description: Update client information including case number
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Updated"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               caseNumber:
 *                 type: string
 *                 example: "CASE-2024-001-UPDATED"
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T10:30:00Z"
 *               assignedLawyer:
 *                 type: string
 *                 example: "Michael Brown"
 *               court:
 *                 type: string
 *                 example: "Supreme Court"
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *                   $ref: '#/components/schemas/ClientWithRelations'
 *       400:
 *         description: Case number already exists
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
  validate(clientIdParamsSchema),
  validate(updateClientSchema),
  clientController.updateClient
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client
 *     description: Delete a specific client by ID (cascades to folders, files, and notes)
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
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
  validate(clientIdParamsSchema),
  clientController.deleteClient
);

export default router;
