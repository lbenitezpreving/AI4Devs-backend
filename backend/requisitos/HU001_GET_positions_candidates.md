# Historia de Usuario: Obtener candidatos por posición

## Descripción
Como reclutador, necesito obtener la lista de todos los candidatos que están en proceso para una posición específica, incluyendo su información básica, etapa actual del proceso y puntuación media, para poder evaluar rápidamente el estado de los candidatos y tomar decisiones informadas.

## Endpoint
- **URL**: `/positions/:id/candidates`
- **Método**: `GET`
- **Parámetros de ruta**:
  - `id` (integer): ID de la posición a consultar

## Respuesta
- **Código de éxito**: `200 OK`
- **Formato**: JSON
- **Estructura de datos**:
```json
{
  "positionId": 123,
  "positionTitle": "Senior Developer",
  "totalCandidates": 5,
  "candidates": [
    {
      "candidateId": 456,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "applicationId": 789,
      "applicationDate": "2023-05-15T10:30:00Z",
      "currentInterviewStep": {
        "id": 2,
        "name": "Technical Interview"
      },
      "averageScore": 4.2,
      "interviews": [
        {
          "id": 101,
          "stepName": "HR Interview",
          "date": "2023-05-20T14:00:00Z",
          "score": 4.0
        },
        {
          "id": 102,
          "stepName": "Technical Interview",
          "date": "2023-05-25T11:00:00Z",
          "score": 4.3
        }
      ]
    },
    // ... más candidatos
  ]
}
```

## Detalles técnicos

### Archivos a modificar
1. **Rutas**:
   - Crear o modificar `/backend/src/routes/positionRoutes.ts` para agregar el nuevo endpoint

2. **Controlador**:
   - Crear o modificar `/backend/src/presentation/controllers/positionController.ts` para agregar el método `getCandidatesByPosition`

3. **Servicios**:
   - Actualizar `/backend/src/application/services/positionService.ts` para agregar la lógica de negocio necesaria

4. **Consultas de base de datos**:
   - Utilizar Prisma para realizar consultas uniendo las tablas: `Position`, `Application`, `Candidate`, `InterviewStep`, e `Interview`

### Implementación
El endpoint debe:
1. Validar que el ID de posición existe
2. Obtener todas las aplicaciones asociadas a esa posición
3. Para cada aplicación, obtener:
   - Datos del candidato (nombre, email)
   - Etapa actual del proceso (nombre e ID)
   - Calcular la puntuación media de todas las entrevistas realizadas
   - Lista de entrevistas con sus puntuaciones

### Consulta Prisma (pseudocódigo)
```typescript
const positionWithCandidates = await prisma.position.findUnique({
  where: { id: parseInt(positionId) },
  include: {
    applications: {
      include: {
        candidate: true,
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

// Transformar los datos y calcular puntuaciones medias
```

## Criterios de aceptación
1. El endpoint devuelve los datos correctos para una posición existente
2. Se calcula correctamente la puntuación media para cada candidato (suma de puntuaciones / número de entrevistas)
3. El endpoint devuelve un error 404 si no existe la posición
4. El endpoint devuelve un array vacío de candidatos si no hay aplicaciones para esa posición
5. El rendimiento es adecuado para posiciones con un gran número de candidatos (paginación opcional)

## Pruebas
Crear pruebas unitarias en `/backend/src/tests/positions` que validen:
1. La respuesta correcta cuando hay candidatos
2. La respuesta correcta cuando no hay candidatos
3. El manejo adecuado de errores

## Requisitos no funcionales
1. **Seguridad**: Verificar que el usuario tiene permisos para ver los candidatos de esta posición
2. **Rendimiento**: Optimizar consultas a la base de datos para evitar problemas con muchos candidatos
3. **Documentación**: Actualizar `api-spec.yaml` con la nueva ruta y estructura de respuesta

## Documentación
Actualizar el archivo `/backend/api-spec.yaml` para incluir la documentación de este nuevo endpoint con todos sus parámetros y respuestas posibles. 