// import express from 'express';
// import { ArbitratorController } from '../modules/arbitration/controllers/arbitrator.controller';
// import { ArbitrationRequestController } from '../modules/arbitration/controllers/arbitration-request.controller';
// import { authMiddleware } from '../modules/auth/middleware/auth.middleware';
// import { uploadProfilePicture } from '../middlewares/upload.middleware';

// const router = express.Router();
// const arbitratorController = new ArbitratorController();
// const requestController = new ArbitrationRequestController();

// // Apply authentication middleware to all routes
// router.use(authMiddleware);

// // Arbitrator routes
// router.post('/arbitrators', uploadProfilePicture.single('profilePicture'), arbitratorController.createArbitrator.bind(arbitratorController));
// router.get('/arbitrators', arbitratorController.getAllArbitrators.bind(arbitratorController));
// router.get('/arbitrators/:id', arbitratorController.getArbitratorById.bind(arbitratorController));
// router.put('/arbitrators/:id', uploadProfilePicture.single('profilePicture'), arbitratorController.updateArbitrator.bind(arbitratorController));
// router.delete('/arbitrators/:id', arbitratorController.deleteArbitrator.bind(arbitratorController));
// router.patch('/arbitrators/:id/toggle-status', arbitratorController.toggleArbitratorStatus.bind(arbitratorController));
// router.get('/arbitrators/stats', arbitratorController.getArbitratorStats.bind(arbitratorController));
// router.get('/arbitrators/active', arbitratorController.getActiveArbitrators.bind(arbitratorController));

// // Arbitration request routes
// router.post('/arbitration-requests', requestController.createRequest.bind(requestController));
// router.get('/arbitration-requests', requestController.getAllRequests.bind(requestController));
// router.get('/arbitration-requests/:id', requestController.getRequestById.bind(requestController));
// router.put('/arbitration-requests/:id', requestController.updateRequest.bind(requestController));
// router.delete('/arbitration-requests/:id', requestController.deleteRequest.bind(requestController));
// router.patch('/arbitration-requests/:id/status', requestController.updateRequestStatus.bind(requestController));
// router.patch('/arbitration-requests/:id/assign', requestController.assignArbitrator.bind(requestController));
// router.get('/arbitration-requests/stats', requestController.getRequestStats.bind(requestController));
// router.get('/arbitration-requests/arbitrator/:arbitratorId', requestController.getRequestsByArbitrator.bind(requestController));

// export default router;
