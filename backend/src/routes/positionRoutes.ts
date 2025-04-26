import { Router } from 'express';
import { getCandidatesByPositionController } from '../presentation/controllers/positionController';

const router = Router();

/**
 * @route GET /positions/:id/candidates
 * @desc Obtiene todos los candidatos de una posición específica
 * @access Private
 */
router.get('/:id/candidates', getCandidatesByPositionController);

export default router; 