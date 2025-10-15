// routes/appointmentRoutes.ts

import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - appointmentWith
 *               - caseId
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Real Estate Closing - Parker Property"
 *               description:
 *                 type: string
 *                 example: "Final closing for commercial property sale"
 *               status:
 *                 type: string
 *                 enum: [upcoming, expired, canceled, completed]
 *                 example: "upcoming"
 *               location:
 *                 type: string
 *                 example: "Federal Court - Main Building 4killo"
 *               appointmentWith:
 *                 type: string
 *                 enum: [court, client, both]
 *                 example: "both"
 *               caseId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T10:00:00Z"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error or missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 */
router.post("/", appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments for the authenticated user (starting from last month)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional start date filter (defaults to last month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional end date filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, expired, canceled, completed]
 *         description: Filter by status
 *       - in: query
 *         name: appointmentWith
 *         schema:
 *           type: string
 *           enum: [court, client, both]
 *         description: Filter by appointment type
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client/case ID
 *     responses:
 *       200:
 *         description: List of user's appointments
 *       401:
 *         description: Unauthorized
 */
router.get("/", appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/calendar:
 *   get:
 *     summary: Get appointments for calendar view (grouped by date)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: Start date for calendar view
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: End date for calendar view
 *     responses:
 *       200:
 *         description: Appointments grouped by date
 *       400:
 *         description: Missing startDate or endDate
 *       401:
 *         description: Unauthorized
 */
router.get("/calendar", appointmentController.getCalendarView);

/**
 * @swagger
 * /api/appointments/status/{status}:
 *   get:
 *     summary: Get appointments by status for authenticated user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [upcoming, expired, canceled, completed]
 *         description: Status to filter by
 *     responses:
 *       200:
 *         description: List of appointments with specified status
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 */
router.get("/status/:status", appointmentController.getAppointmentsByStatus);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.get("/:id", appointmentController.getAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Appointment Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               status:
 *                 type: string
 *                 enum: [upcoming, expired, canceled, completed]
 *                 example: "completed"
 *               location:
 *                 type: string
 *                 example: "New Location"
 *               appointmentWith:
 *                 type: string
 *                 enum: [court, client, both]
 *                 example: "client"
 *               caseId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-20T14:00:00Z"
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User can only update their own appointments
 *       404:
 *         description: Appointment not found
 */
router.put("/:id", appointmentController.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User can only delete their own appointments
 *       404:
 *         description: Appointment not found
 */
router.delete("/:id", appointmentController.deleteAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [upcoming, expired, canceled, completed]
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User can only update their own appointments
 *       404:
 *         description: Appointment not found
 */
router.patch("/:id/status", appointmentController.updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/admin/all:
 *   get:
 *     summary: Get all appointments (Managers and Admins only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional start date filter (defaults to last month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional end date filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, expired, canceled, completed]
 *         description: Filter by status
 *       - in: query
 *         name: appointmentWith
 *         schema:
 *           type: string
 *           enum: [court, client, both]
 *         description: Filter by appointment type
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client/case ID
 *     responses:
 *       200:
 *         description: List of all appointments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get("/admin/all", appointmentController.getAllAppointments);

export default router;
