import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interfaz para los datos de actualización de la etapa de un candidato
 */
interface UpdateCandidateStageData {
  applicationId: number;
  interviewStepId: number;
  notes?: string;
}

/**
 * Interfaz para la estructura de InterviewStep
 */
interface InterviewStep {
  id: number;
  name: string;
  interviewFlowId: number;
  interviewTypeId: number;
  orderIndex: number;
}

/**
 * Actualiza la etapa de entrevista de un candidato en una aplicación específica
 * @param candidateId ID del candidato
 * @param applicationData Datos de la actualización (applicationId, interviewStepId, notes)
 * @returns Datos de la aplicación actualizada con la etapa anterior y actual
 */
export const updateCandidateStage = async (candidateId: number, applicationData: UpdateCandidateStageData) => {
  try {
    // Verificar que el candidato existe
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Obtener la aplicación y verificar que pertenece al candidato
    const application = await prisma.application.findUnique({
      where: { id: applicationData.applicationId },
      include: {
        candidate: true,
        position: {
          include: {
            interviewFlow: {
              include: {
                interviewSteps: true
              }
            }
          }
        },
        interviewStep: true
      }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verificar que la aplicación pertenece al candidato
    if (application.candidateId !== candidateId) {
      throw new Error('Application does not belong to this candidate');
    }

    // Verificar que la nueva etapa existe en el flujo de entrevistas de la posición
    const isValidStep = application.position.interviewFlow.interviewSteps
      .some((step: InterviewStep) => step.id === applicationData.interviewStepId);

    if (!isValidStep) {
      throw new Error('Interview step is not valid for this position');
    }

    // Almacenar la etapa previa para la respuesta
    const previousStep = application.interviewStep;

    // Actualizar la aplicación
    const updatedApplication = await prisma.application.update({
      where: { id: applicationData.applicationId },
      data: {
        currentInterviewStep: applicationData.interviewStepId,
        notes: applicationData.notes || application.notes
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        position: {
          select: {
            id: true,
            title: true
          }
        },
        interviewStep: true
      }
    });

    // Construir respuesta con información adicional
    const response = {
      success: true,
      application: {
        id: updatedApplication.id,
        candidateId: updatedApplication.candidateId,
        positionId: updatedApplication.positionId,
        currentInterviewStep: {
          id: updatedApplication.interviewStep.id,
          name: updatedApplication.interviewStep.name
        },
        previousInterviewStep: {
          id: previousStep.id,
          name: previousStep.name
        },
        updatedAt: new Date().toISOString(),
        notes: updatedApplication.notes
      }
    };

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error updating candidate stage');
  }
}; 