import { PrismaClient } from '@prisma/client';

// Creamos una instancia por defecto
const defaultPrisma = new PrismaClient();

/**
 * Interfaz para la estructura de Interview
 */
interface Interview {
  id: number;
  interviewDate: Date;
  score: number | null;
  interviewStep: {
    id: number;
    name: string;
  };
}

/**
 * Interfaz para la estructura de Application
 */
interface Application {
  id: number;
  applicationDate: Date;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  interviewStep: {
    id: number;
    name: string;
  };
  interviews: Interview[];
}

/**
 * Obtiene los candidatos para una posición específica con sus datos y puntuaciones
 * @param positionId ID de la posición
 * @param prismaClient Opcional: Instancia de PrismaClient para testing
 * @returns Datos de la posición con sus candidatos
 */
export const getCandidatesByPosition = async (positionId: number, prismaClient = defaultPrisma) => {
  try {
    // Verificar si la posición existe
    const position = await prismaClient.position.findUnique({
      where: { id: positionId }
    });

    if (!position) {
      throw new Error('Position not found');
    }

    // Obtener la posición con todas las aplicaciones y datos relacionados
    const positionWithCandidates = await prismaClient.position.findUnique({
      where: { id: positionId },
      select: {
        id: true,
        title: true,
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            interviewStep: true,
            interviews: {
              include: {
                interviewStep: true
              }
            }
          }
        }
      }
    });

    // Construir la respuesta con el formato deseado
    const response = {
      positionId: position.id,
      positionTitle: position.title,
      totalCandidates: positionWithCandidates?.applications.length || 0,
      candidates: positionWithCandidates?.applications.map((application: Application) => {
        // Calcular la puntuación media
        const scores = application.interviews
          .filter((interview: Interview) => interview.score !== null)
          .map((interview: Interview) => interview.score as number);
        
        const averageScore = scores.length > 0 
          ? parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1))
          : null;

        return {
          candidateId: application.candidate.id,
          fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          email: application.candidate.email,
          applicationId: application.id,
          applicationDate: application.applicationDate,
          currentInterviewStep: {
            id: application.interviewStep.id,
            name: application.interviewStep.name
          },
          averageScore,
          interviews: application.interviews.map((interview: Interview) => ({
            id: interview.id,
            stepName: interview.interviewStep.name,
            date: interview.interviewDate,
            score: interview.score
          }))
        };
      }) || []
    };

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error retrieving candidates for position');
  }
}; 