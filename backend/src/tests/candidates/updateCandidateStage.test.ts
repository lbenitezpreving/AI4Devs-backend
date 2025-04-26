import { updateCandidateStage } from '../../application/services/applicationService';
import { PrismaClient } from '@prisma/client';

// Definir interfaz para mock de PrismaClient
interface MockPrismaClient {
  candidate: {
    findUnique: jest.Mock;
  };
  application: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
}

// Crear mocks simples para los tests
const mockCandidate = {
  id: 456,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
};

const mockInterviewSteps = [
  { id: 1, name: 'HR Interview', interviewFlowId: 1, interviewTypeId: 1, orderIndex: 1 },
  { id: 2, name: 'Technical Interview', interviewFlowId: 1, interviewTypeId: 2, orderIndex: 2 },
  { id: 3, name: 'Final Interview', interviewFlowId: 1, interviewTypeId: 3, orderIndex: 3 }
];

const mockApplication = {
  id: 789,
  candidateId: 456,
  positionId: 123,
  currentInterviewStep: 2,
  applicationDate: new Date('2023-05-15T10:30:00Z'),
  notes: 'Original notes',
  candidate: mockCandidate,
  position: {
    id: 123,
    title: 'Senior Developer',
    interviewFlowId: 1,
    interviewFlow: {
      id: 1,
      description: 'Standard Interview Process',
      interviewSteps: mockInterviewSteps
    }
  },
  interviewStep: mockInterviewSteps[1] // Technical Interview
};

// Mock del cliente de Prisma
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        findUnique: jest.fn()
      },
      application: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    }))
  };
});

describe('updateCandidateStage', () => {
  let prisma: MockPrismaClient;
  
  beforeEach(() => {
    // Crear una nueva instancia del cliente mockeado para cada test
    prisma = new PrismaClient() as unknown as MockPrismaClient;
    jest.clearAllMocks();
    
    // Configurar los mocks por defecto
    prisma.candidate.findUnique.mockResolvedValue(mockCandidate);
    prisma.application.findUnique.mockResolvedValue(mockApplication);
    prisma.application.update.mockResolvedValue({
      ...mockApplication,
      currentInterviewStep: 3,
      interviewStep: mockInterviewSteps[2]
    });
  });

  it('should update the candidate stage successfully', async () => {
    const result = await updateCandidateStage(456, {
      applicationId: 789,
      interviewStepId: 3,
      notes: 'Updated to final interview'
    });
    
    expect(result.success).toBe(true);
    expect(result.application.currentInterviewStep.id).toBe(3);
    expect(result.application.previousInterviewStep.id).toBe(2);
  });

  it('should throw an error for a non-existent candidate', async () => {
    prisma.candidate.findUnique.mockResolvedValue(null);
    
    await expect(updateCandidateStage(999, {
      applicationId: 789,
      interviewStepId: 3
    })).rejects.toThrow('Candidate not found');
  });

  it('should throw an error for a non-existent application', async () => {
    prisma.application.findUnique.mockResolvedValue(null);
    
    await expect(updateCandidateStage(456, {
      applicationId: 999,
      interviewStepId: 3
    })).rejects.toThrow('Application not found');
  });

  it('should throw an error if the application does not belong to the candidate', async () => {
    prisma.application.findUnique.mockResolvedValue({
      ...mockApplication,
      candidateId: 789 // ID diferente al candidato especificado
    });
    
    await expect(updateCandidateStage(456, {
      applicationId: 789,
      interviewStepId: 3
    })).rejects.toThrow('Application does not belong to this candidate');
  });

  it('should throw an error if the interview step is not valid', async () => {
    await expect(updateCandidateStage(456, {
      applicationId: 789,
      interviewStepId: 999 // ID de etapa inválido
    })).rejects.toThrow('Interview step is not valid for this position');
  });
}); 