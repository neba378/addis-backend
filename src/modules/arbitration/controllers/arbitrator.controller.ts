// import { Request, Response } from 'express';
// import { ArbitratorService } from '../services/arbitrator.service';
// import {
//   createArbitratorSchema,
//   updateArbitratorSchema,
//   arbitratorIdSchema,
//   paginationSchema
// } from '../../../validations/arbitration';
// import { getProfilePictureUrl, deleteProfilePictureFile } from '../../../middlewares/upload.middleware';

// const arbitratorService = new ArbitratorService();

// export class ArbitratorController {
//   async createArbitrator(req: Request, res: Response): Promise<void> {
//     try {

//       const validatedData = createArbitratorSchema.parse(req.body);

//       // Handle file upload
//       let profilePictureUrl = null;
//       if (req.file) {
//         profilePictureUrl = getProfilePictureUrl(req.file.filename);

//       } else if (validatedData.profilePicture) {
//         // If no file uploaded but URL provided, use the URL
//         profilePictureUrl = validatedData.profilePicture;

//       }

//       // Convert undefined to null for Prisma compatibility
//       const createData = {
//         fullName: validatedData.fullName,
//         profilePicture: profilePictureUrl,
//         location: validatedData.location,
//         languages: validatedData.languages,
//         specializationAreas: validatedData.specializationAreas,
//         yearsOfExperience: validatedData.yearsOfExperience,
//         description: validatedData.description,
//       };

//       const arbitrator = await arbitratorService.createArbitrator(createData);

//       res.status(201).json({
//         success: true,
//         message: 'Arbitrator created successfully',
//         data: arbitrator,
//       });
//     } catch (error: any) {
//       if (error.name === 'ZodError') {
//         res.status(400).json({
//           success: false,
//           message: 'Validation error',
//           errors: error.errors,
//         });
//         return;
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to create arbitrator',
//         error: error.message,
//       });
//     }
//   }

//   async getAllArbitrators(req: Request, res: Response): Promise<void> {
//     try {

//       const arbitrators = await arbitratorService.getAllArbitrators();

//       res.status(200).json({
//         success: true,
//         data: arbitrators,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to fetch arbitrators',
//       });
//     }
//   }

//   async getArbitratorById(req: Request, res: Response): Promise<void> {
//     try {
//       const { id } = arbitratorIdSchema.parse(req.params);
//       const arbitrator = await arbitratorService.getArbitratorById(id);

//       if (!arbitrator) {
//         res.status(404).json({
//           success: false,
//           message: 'Arbitrator not found',
//         });
//         return;
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Arbitrator retrieved successfully',
//         data: arbitrator,
//       });
//     } catch (error: any) {
//       if (error.name === 'ZodError') {
//         res.status(400).json({
//           success: false,
//           message: 'Validation error',
//           errors: error.errors,
//         });
//         return;
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve arbitrator',
//         error: error.message,
//       });
//     }
//   }

//   async updateArbitrator(req: Request, res: Response): Promise<void> {
//     try {
//       const { id } = arbitratorIdSchema.parse(req.params);
//       const validatedData = updateArbitratorSchema.parse(req.body);

//       // Handle file upload
//       let profilePictureUrl = null;
//       if (req.file) {
//         profilePictureUrl = getProfilePictureUrl(req.file.filename);
//       } else if (validatedData.profilePicture) {
//         // If no file uploaded but URL provided, use the URL
//         profilePictureUrl = validatedData.profilePicture;
//       }

//       // Convert undefined to null for Prisma compatibility
//       const updateData: any = {};
//       if (validatedData.fullName !== undefined) updateData.fullName = validatedData.fullName;
//       if (profilePictureUrl !== null) updateData.profilePicture = profilePictureUrl;
//       if (validatedData.location !== undefined) updateData.location = validatedData.location;
//       if (validatedData.languages !== undefined) updateData.languages = validatedData.languages;
//       if (validatedData.specializationAreas !== undefined) updateData.specializationAreas = validatedData.specializationAreas;
//       if (validatedData.yearsOfExperience !== undefined) updateData.yearsOfExperience = validatedData.yearsOfExperience;
//       if (validatedData.description !== undefined) updateData.description = validatedData.description;
//       if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

//       const arbitrator = await arbitratorService.updateArbitrator(id, updateData);

//       if (!arbitrator) {
//         res.status(404).json({
//           success: false,
//           message: 'Arbitrator not found',
//         });
//         return;
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Arbitrator updated successfully',
//         data: arbitrator,
//       });
//     } catch (error: any) {
//       if (error.name === 'ZodError') {
//         res.status(400).json({
//           success: false,
//           message: 'Validation error',
//           errors: error.errors,
//         });
//         return;
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to update arbitrator',
//         error: error.message,
//       });
//     }
//   }

//   async deleteArbitrator(req: Request, res: Response): Promise<void> {
//     try {
//       const { id } = arbitratorIdSchema.parse(req.params);

//       // Get arbitrator first to access profile picture
//       const arbitrator = await arbitratorService.getArbitratorById(id);
//       if (!arbitrator) {
//         res.status(404).json({
//           success: false,
//           message: 'Arbitrator not found',
//         });
//         return;
//       }

//       // Delete profile picture file if it exists
//       if (arbitrator.profilePicture) {
//         deleteProfilePictureFile(arbitrator.profilePicture);
//       }

//       const deleted = await arbitratorService.deleteArbitrator(id);

//       if (!deleted) {
//         res.status(404).json({
//           success: false,
//           message: 'Arbitrator not found',
//         });
//         return;
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Arbitrator deleted successfully',
//       });
//     } catch (error: any) {
//       if (error.name === 'ZodError') {
//         res.status(400).json({
//           success: false,
//           message: 'Validation error',
//           errors: error.errors,
//         });
//         return;
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete arbitrator',
//         error: error.message,
//       });
//     }
//   }

//   async toggleArbitratorStatus(req: Request, res: Response): Promise<void> {
//     try {
//       const { id } = arbitratorIdSchema.parse(req.params);
//       const arbitrator = await arbitratorService.toggleArbitratorStatus(id);

//       if (!arbitrator) {
//         res.status(404).json({
//           success: false,
//           message: 'Arbitrator not found',
//         });
//         return;
//       }

//       res.status(200).json({
//         success: true,
//         message: `Arbitrator ${arbitrator.isActive ? 'activated' : 'deactivated'} successfully`,
//         data: arbitrator,
//       });
//     } catch (error: any) {
//       if (error.name === 'ZodError') {
//         res.status(400).json({
//           success: false,
//           message: 'Validation error',
//           errors: error.errors,
//         });
//         return;
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to toggle arbitrator status',
//         error: error.message,
//       });
//     }
//   }

//   async getActiveArbitrators(req: Request, res: Response): Promise<void> {
//     try {
//       const arbitrators = await arbitratorService.getActiveArbitrators();

//       res.status(200).json({
//         success: true,
//         message: 'Active arbitrators retrieved successfully',
//         data: arbitrators,
//       });
//     } catch (error: any) {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve active arbitrators',
//         error: error.message,
//       });
//     }
//   }

//   async getArbitratorStats(req: Request, res: Response): Promise<void> {
//     try {
//       const stats = await arbitratorService.getArbitratorStats();

//       res.status(200).json({
//         success: true,
//         message: 'Arbitrator statistics retrieved successfully',
//         data: stats,
//       });
//     } catch (error: any) {
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve arbitrator statistics',
//         error: error.message,
//       });
//     }
//   }
// }
