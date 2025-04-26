# Historia de Usuario: Actualizar etapa de candidato

## Descripción
Como reclutador, necesito poder actualizar la etapa actual del proceso de selección en la que se encuentra un candidato específico, para reflejar su progreso a través del flujo de entrevistas y mantener actualizado el sistema con el estado real del proceso de selección.

## Endpoint
- **URL**: `/candidates/:id/stage`
- **Método**: `PUT`
- **Parámetros de ruta**:
  - `id` (integer): ID del candidato a actualizar

## Cuerpo de la solicitud
```json
{
  "applicationId": 789,
  "interviewStepId": 3,
  "notes": "Candidato promovido a la siguiente fase tras completar con éxito la entrevista técnica"
}
```

- **applicationId** (obligatorio): ID de la aplicación del candidato a la posición
- **interviewStepId** (obligatorio): ID de la nueva etapa de entrevista a la que se moverá el candidato
- **notes** (opcional): Notas sobre el cambio de etapa

## Respuesta
- **Código de éxito**: `200 OK`
- **Formato**: JSON
- **Estructura de datos**:
```json
{
  "success": true,
  "application": {
    "id": 789,
    "candidateId": 456,
    "positionId": 123,
    "currentInterviewStep": {
      "id": 3,
      "name": "Final Interview"
    },
    "previousInterviewStep": {
      "id": 2,
      "name": "Technical Interview"
    },
    "updatedAt": "2023-06-10T15:45:30Z",
    "notes": "Candidato promovido a la siguiente fase tras completar con éxito la entrevista técnica"
  }
}
```

## Detalles técnicos

### Archivos a modificar
1. **Rutas**:
   - Crear o modificar `/backend/src/routes/candidateRoutes.ts` para agregar el nuevo endpoint

2. **Controlador**:
   - Crear o modificar `/backend/src/presentation/controllers/candidateController.ts` para agregar el método `updateCandidateStage`

3. **Servicios**:
   - Actualizar `/backend/src/application/services/applicationService.ts` para agregar la lógica de negocio necesaria

4. **Actualizaciones de base de datos**:
   - Utilizar Prisma para actualizar el campo `currentInterviewStep` en la tabla `Application`
   - Opcionalmente, registrar el historial del cambio (si existe una tabla de historial)

### Validaciones
El endpoint debe verificar:
1. Que el candidato existe
2. Que la aplicación pertenece al candidato especificado
3. Que la nueva etapa de entrevista existe y es válida dentro del flujo de entrevistas de la posición
4. Que el usuario tiene permisos para realizar el cambio

### Actualización Prisma (pseudocódigo)
```typescript
// Primero verificamos que todo es correcto
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

// Validar que la aplicación pertenece al candidato
if (application.candidateId !== parseInt(candidateId)) {
  throw new Error('La aplicación no pertenece a este candidato');
}

// Validar que la nueva etapa existe en el flujo de la posición
const isValidStep = application.position.interviewFlow.interviewSteps
  .some(step => step.id === applicationData.interviewStepId);

if (!isValidStep) {
  throw new Error('La etapa de entrevista no es válida para esta posición');
}

// Almacenar la etapa previa para la respuesta
const previousStep = application.interviewStep;

// Actualizar la aplicación
const updatedApplication = await prisma.application.update({
  where: { id: applicationData.applicationId },
  data: {
    currentInterviewStep: applicationData.interviewStepId,
    notes: applicationData.notes || application.notes,
    // Actualizar otros campos según sea necesario
  },
  include: {
    interviewStep: true
  }
});
```

## Criterios de aceptación
1. El endpoint actualiza correctamente la etapa del candidato en una aplicación válida
2. Se realizan todas las validaciones necesarias antes de la actualización
3. Se devuelve un error si:
   - El candidato no existe (404)
   - La aplicación no pertenece al candidato (400)
   - La nueva etapa no es válida para el flujo de entrevistas de la posición (400)
   - El usuario no tiene permisos (403)
4. Se registra adecuadamente la información del cambio, incluyendo las notas opcionales

## Pruebas
Crear pruebas unitarias en `/backend/src/tests/candidates` que validen:
1. La actualización exitosa de la etapa
2. El manejo adecuado de todos los casos de error
3. Las validaciones de permisos

## Requisitos no funcionales
1. **Seguridad**: Verificar que el usuario tiene permisos para actualizar la etapa del candidato
2. **Auditabilidad**: Registrar quién hizo el cambio y cuándo (agregar campos `updatedBy` y `updatedAt` si no existen)
3. **Integridad de datos**: Garantizar que solo se pueden asignar etapas válidas según el flujo de entrevistas de la posición
4. **Documentación**: Actualizar `api-spec.yaml` con el nuevo endpoint

## Documentación
Actualizar el archivo `/backend/api-spec.yaml` para incluir la documentación del nuevo endpoint, incluyendo:
- Parámetros requeridos y opcionales
- Estructura de la respuesta
- Posibles códigos de error y sus mensajes 