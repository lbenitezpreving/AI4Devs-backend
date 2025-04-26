import { updateCandidateStage } from '../../application/services/applicationService';
import { PrismaClient } from '@prisma/client';

// Mock de Prisma
jest.mock('@prisma/client', () => {
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

  const mockInterviewFlow = {
    id: 1,
    description: 'Standard Interview Process',
    interviewSteps: mockInterviewSteps
  };

  const mockPosition = {
    id: 123,
    title: 'Senior Developer',
    interviewFlowId: 1,
    interviewFlow: mockInterviewFlow
  };

  const mockApplication = {
    id: 789,
    candidateId: 456,
    positionId: 123,
    currentInterviewStep: 2,
    applicationDate: new Date('2023-05-15T10:30:00Z'),
    notes: 'Original notes',
    candidate: mockCandidate,
    position: mockPosition,
    interviewStep: mockInterviewSteps[1] // Technical Interview
  };

  const mockUpdatedApplication = {
    ...mockApplication,
    currentInterviewStep: 3,
    notes: 'Updated to final interview',
    interviewStep: mockInterviewSteps[2] // Final Interview
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 456) {
            return Promise.resolve(mockCandidate);
          }
          return Promise.resolve(null);
        })
      },
      application: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 789) {
            return Promise.resolve(mockApplication);
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          if (where.id === 789) {
            const updated = {
              ...mockApplication,
              currentInterviewStep: data.currentInterviewStep,
              notes: data.notes,
              interviewStep: mockInterviewSteps.find(step => step.id === data.currentInterviewStep)
            };
            return Promise.resolve(updated);
          }
          return Promise.resolve(null);
        })
      }
    }))
  };
});

describe('updateCandidateStage', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  it('should update the candidate stage successfully', async () => {
    const result = await updateCandidateStage(456, {
      applicationId: 789,
      interviewStepId: 3,
      notes: 'Updated to final interview'
    });
    
    expect(result).toEqual({
      success: true,
      application: {
        id: 789,
        candidateId: 456,
        positionId: 123,
        currentInterviewStep: {
          id: 3,
          name: 'Final Interview'
        },
        previousInterviewStep: {
          id: 2,
          name: 'Technical Interview'
        },
        updatedAt: expect.any(String),
        notes: 'Updated to final interview'
      }
    });
  });

  it('should throw an error for a non-existent candidate', async () => {
    await expect(updateCandidateStage(999, {
      applicationId: 789,
      interviewStepId: 3
    })).rejects.toThrow('Candidate not found');
  });

  it('should throw an error for a non-existent application', async () => {
    await expect(updateCandidateStage(456, {
      applicationId: 999,
      interviewStepId: 3
    })).rejects.toThrow('Application not found');
  });

  it('should throw an error if the application does not belong to the candidate', async () => {
    // Mockear una aplicación que pertenece a otro candidato
    jest.spyOn(prisma.application, 'findUnique').mockResolvedValueOnce({
      ...mockApplication,
      candidateId: 789 // Diferente ID de candidato
    } as any);

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