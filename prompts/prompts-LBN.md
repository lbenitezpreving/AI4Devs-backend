## Prompt 1
**Fecha:** 26/04/2025
**Modelo:** Claude 3.7 Sonnet

**Usuario:**
Eres un experto arquitecto de sistemas. 
Explicame en que consiste este proyecto, analizando todos los ficheros y dándome una explicación básica de su funcionamiento.
No hagas nada, solo aporta información.

**Asistente:**
Voy a explorar este proyecto para explicarte en qué consiste y cómo funciona.

Este proyecto es un sistema de seguimiento de talento (Talent Tracking System) que consta de:

### Arquitectura general
El proyecto sigue una arquitectura full-stack con dos componentes principales:

1. **Backend (Node.js/Express/TypeScript)**:
   - Utiliza Prisma como ORM para interactuar con una base de datos PostgreSQL
   - Implementa una arquitectura de capas (hexagonal/clean) con separación en:
     - `domain`: Modelos y lógica de negocio
     - `application`: Casos de uso y servicios
     - `presentation`: Controladores y API
     - `routes`: Definición de rutas REST

2. **Frontend (React/TypeScript)**:
   - Aplicación SPA desarrollada con React
   - Incluye componentes para la gestión de candidatos y reclutamiento

### Funcionalidades principales
El sistema permite:

1. **Gestión de candidatos**:
   - Registro de información personal (nombre, apellido, email, teléfono)
   - Almacenamiento de historial educativo y experiencia laboral
   - Carga y gestión de CV (currículum vitae)

2. **Procesos de selección**:
   - Definición de posiciones/vacantes por empresas
   - Flujos de entrevistas personalizables
   - Seguimiento de candidatos a través del proceso de selección

3. **Evaluación y seguimiento**:
   - Registro de entrevistas
   - Valoración de candidatos
   - Notas y comentarios sobre el proceso

### Modelo de datos
La base de datos incluye entidades como:
- Candidate (Candidato)
- Education (Educación)
- WorkExperience (Experiencia laboral)
- Resume (Currículum)
- Company (Empresa)
- Position (Puesto)
- Application (Solicitud)
- Interview (Entrevista)
- InterviewFlow/InterviewStep (Flujo/Pasos de entrevista)

### Despliegue
El proyecto utiliza Docker para gestionar la base de datos PostgreSQL, lo que facilita su configuración y despliegue. El backend se ejecuta en el puerto 3010 y el frontend en el puerto 3000.

En resumen, este es un sistema completo para la gestión del ciclo de vida del reclutamiento, desde la captación de candidatos hasta la finalización del proceso de selección, con un enfoque modular y escalable.

## Prompt 2
**Fecha:** 26/04/2025
**Modelo:** Claude 3.7 Sonnet

**Usuario:**
Eres un experto en producto.

A continuación indico dos historias de usuario a desarrollar.

1.-
GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:
Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

2.-
PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.


 A estas historias de usuarios le faltan detalle técnico y específico para permitir al developer ser totalmente autónomo a la hora de completarla.

 Por favor entiende la necesidad y proporciona una historia mejorada que sea más clara, específica y concisa acorde a las mejores prácticas de producto, incluyendo descripción completa de la funcionalidad, lista exhaustiva de campos a tocar, estructura y URL de los endpoints necesarios, ficheros a modificar acorde a la arquitectura y buenas prácticas, pasos para que la tarea se asuma como completada, cómo actualizar la documentación que sea relevante o crear tests unitarios, y requisitos no funcionales relativos a seguridad, rendimiento, etc. 

Devuélvelas en formato markdown, cada una en un fichero independiente, con un nombre que haga referencia a la historia de usuario. Crealos dentro de la carpeta existente denominada "requisitos", dentro del directorio /backend.

Además, sigue las instrucciones del fichero @instrucciones.md para guardar el prompt y la salida en el formato indicados, en el fichero indicado.

**Asistente:**
He creado dos historias de usuario detalladas en formato markdown dentro de la carpeta "requisitos" en el directorio backend:

1. `backend/requisitos/HU001_GET_positions_candidates.md`: Contiene la historia de usuario mejorada para obtener candidatos por posición.

2. `backend/requisitos/HU002_PUT_candidates_stage.md`: Contiene la historia de usuario mejorada para actualizar la etapa de un candidato.

Ambos archivos incluyen descripciones completas, detalles técnicos, criterios de aceptación, requisitos no funcionales y toda la información necesaria para que un desarrollador pueda implementar las funcionalidades de manera autónoma.
