import { getCandidatesByPosition } from '../../application/services/positionService';
import { PrismaClient } from '@prisma/client';

// Interfaz para mock de PrismaClient
interface MockPrismaClient {
  position: {
    findUnique: jest.Mock;
  };
}

// Mock de Prisma
jest.mock('@prisma/client', () => {
  const mockPosition = {
    id: 123,
    title: 'Senior Developer',
  };

  const mockCandidateApplication = {
    id: 789,
    candidateId: 456,
    positionId: 123,
    applicationDate: new Date('2023-05-15T10:30:00Z'),
    currentInterviewStep: 2,
    candidate: {
      id: 456,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    interviewStep: {
      id: 2,
      name: 'Technical Interview',
    },
    interviews: [
      {
        id: 101,
        interviewStepId: 1,
        applicationId: 789,
        interviewDate: new Date('2023-05-20T14:00:00Z'),
        score: 4.0,
        interviewStep: {
          id: 1,
          name: 'HR Interview'
        }
      },
      {
        id: 102,
        interviewStepId: 2,
        applicationId: 789,
        interviewDate: new Date('2023-05-25T11:00:00Z'),
        score: 4.3,
        interviewStep: {
          id: 2,
          name: 'Technical Interview'
        }
      }
    ]
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      position: {
        findUnique: jest.fn().mockImplementation(function(params) {
          const where = params.where;
          if (where.id === 123) {
            if (params.select) {
              // Para la segunda llamada con select
              return Promise.resolve({
                id: mockPosition.id,
                title: mockPosition.title,
                applications: [mockCandidateApplication]
              });
            }
            // Para la primera llamada sin select
            return Promise.resolve(mockPosition);
          }
          return Promise.resolve(null);
        })
      },
    }))
  };
});

describe('getCandidatesByPosition', () => {
  let prisma: MockPrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient() as unknown as MockPrismaClient;
    jest.clearAllMocks();
  });

  it('should return candidates for a valid position', async () => {
    const result = await getCandidatesByPosition(123, prisma);
    
    expect(result).toEqual({
      positionId: 123,
      positionTitle: 'Senior Developer',
      totalCandidates: 1,
      candidates: [
        {
          candidateId: 456,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          applicationId: 789,
          applicationDate: expect.any(Date),
          currentInterviewStep: {
            id: 2,
            name: 'Technical Interview'
          },
          averageScore: 4.2,
          interviews: [
            {
              id: 101,
              stepName: 'HR Interview',
              date: expect.any(Date),
              score: 4.0
            },
            {
              id: 102,
              stepName: 'Technical Interview',
              date: expect.any(Date),
              score: 4.3
            }
          ]
        }
      ]
    });
  });

  it('should throw an error for a non-existent position', async () => {
    await expect(getCandidatesByPosition(999, prisma)).rejects.toThrow('Position not found');
  });
}); 