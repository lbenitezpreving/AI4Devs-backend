import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';
import { updateCandidateStage } from '../../application/services/applicationService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Controlador para actualizar la etapa de un candidato en el proceso de selección
 * @param req Solicitud HTTP con el ID del candidato y datos de la aplicación
 * @param res Respuesta HTTP
 */
export const updateCandidateStageController = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidateId = parseInt(req.params.id);
        
        // Validar que el ID sea un número válido
        if (isNaN(candidateId)) {
            res.status(400).json({ error: 'Invalid candidate ID format' });
            return;
        }
        
        // Validar que los datos requeridos estén presentes
        const { applicationId, interviewStepId, notes } = req.body;
        
        if (!applicationId || !interviewStepId) {
            res.status(400).json({ error: 'Application ID and interview step ID are required' });
            return;
        }
        
        // Convertir a números si son enviados como strings
        const appId = typeof applicationId === 'string' ? parseInt(applicationId) : applicationId;
        const stepId = typeof interviewStepId === 'string' ? parseInt(interviewStepId) : interviewStepId;
        
        if (isNaN(appId) || isNaN(stepId)) {
            res.status(400).json({ error: 'Invalid application ID or interview step ID format' });
            return;
        }
        
        const result = await updateCandidateStage(candidateId, {
            applicationId: appId,
            interviewStepId: stepId,
            notes
        });
        
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            // Manejar errores específicos con códigos de estado apropiados
            switch (error.message) {
                case 'Candidate not found':
                    res.status(404).json({ error: 'Candidate not found' });
                    break;
                case 'Application not found':
                    res.status(404).json({ error: 'Application not found' });
                    break;
                case 'Application does not belong to this candidate':
                    res.status(400).json({ error: 'Application does not belong to this candidate' });
                    break;
                case 'Interview step is not valid for this position':
                    res.status(400).json({ error: 'Interview step is not valid for this position' });
                    break;
                default:
                    console.error('Error updating candidate stage:', error);
                    res.status(500).json({ error: 'Internal server error' });
            }
        } else {
            console.error('Unknown error updating candidate stage:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export { addCandidate };