import { Request, Response } from 'express';
import { ArbitrationRequestService } from '../services/arbitration-request.service';
import { 
  createArbitrationRequestSchema, 
  updateArbitrationRequestSchema, 
  requestIdSchema,
  paginationSchema 
} from '../../../validations/arbitration';

const requestService = new ArbitrationRequestService();

export class ArbitrationRequestController {
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createArbitrationRequestSchema.parse(req.body);
      
      // Convert undefined to null for Prisma compatibility
      const createData = {
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        emailAddress: validatedData.emailAddress ?? null,
        location: validatedData.location ?? null,
        preferredLanguages: validatedData.preferredLanguages ?? null,
        typeOfDispute: validatedData.typeOfDispute,
        disputeSummary: validatedData.disputeSummary,
        preferredArbitratorId: validatedData.preferredArbitratorId ?? null,
      };
      
      const request = await requestService.createRequest(createData);
      
      res.status(201).json({
        success: true,
        message: 'Arbitration request submitted successfully',
        data: request,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to submit arbitration request',
        error: error.message,
      });
    }
  }

  async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
     
      
      const requests = await requestService.getAllRequests();
      
     
      
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
     
      res.status(500).json({
        success: false,
        message: 'Failed to fetch arbitration requests',
      });
    }
  }

  async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = requestIdSchema.parse(req.params);
      const request = await requestService.getRequestById(id);
      
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Arbitration request not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Arbitration request retrieved successfully',
        data: request,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve arbitration request',
        error: error.message,
      });
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = requestIdSchema.parse(req.params);
      const validatedData = updateArbitrationRequestSchema.parse(req.body);
      
      // Convert undefined to null for Prisma compatibility
      const updateData: any = {};
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      if (validatedData.adminNotes !== undefined) updateData.adminNotes = validatedData.adminNotes;
      if (validatedData.preferredArbitratorId !== undefined) updateData.preferredArbitratorId = validatedData.preferredArbitratorId;
      
      const request = await requestService.updateRequest(id, updateData);
      
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Arbitration request not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Arbitration request updated successfully',
        data: request,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update arbitration request',
        error: error.message,
      });
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = requestIdSchema.parse(req.params);
      const deleted = await requestService.deleteRequest(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Arbitration request not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Arbitration request deleted successfully',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete arbitration request',
        error: error.message,
      });
    }
  }

  async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = requestIdSchema.parse(req.params);
      const { status, adminNotes } = req.body;
      
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required',
        });
        return;
      }
      
      const request = await requestService.updateRequestStatus(id, status);
      
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Arbitration request not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Request status updated successfully',
        data: request,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: error.message,
      });
    }
  }

  async assignArbitrator(req: Request, res: Response): Promise<void> {
    try {
      const { id } = requestIdSchema.parse(req.params);
      const { arbitratorId } = req.body;
      
      if (!arbitratorId) {
        res.status(400).json({
          success: false,
          message: 'Arbitrator ID is required',
        });
        return;
      }
      
      const request = await requestService.assignArbitrator(id, arbitratorId);
      
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Arbitration request not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Arbitrator assigned successfully',
        data: request,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to assign arbitrator',
        error: error.message,
      });
    }
  }

  async getRequestStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await requestService.getRequestStats();
      
      res.status(200).json({
        success: true,
        message: 'Request statistics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve request statistics',
        error: error.message,
      });
    }
  }

  async getRequestsByArbitrator(req: Request, res: Response): Promise<void> {
    try {
      const { arbitratorId } = req.params;
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await requestService.getRequestsByArbitrator(arbitratorId as string);
      
      res.status(200).json({
        success: true,
        message: 'Arbitrator requests retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve arbitrator requests',
        error: error.message,
      });
    }
  }
} 