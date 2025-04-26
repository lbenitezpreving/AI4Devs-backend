import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

/**
 * Controlador para obtener todos los candidatos de una posición específica
 * @param req Solicitud HTTP con el ID de la posición
 * @param res Respuesta HTTP
 */
export const getCandidatesByPositionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const positionId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(positionId)) {
      res.status(400).json({ error: 'Invalid position ID format' });
      return;
    }
    
    const result = await getCandidatesByPosition(positionId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Position not found') {
      res.status(404).json({ error: 'Position not found' });
    } else {
      console.error('Error getting candidates by position:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}; 