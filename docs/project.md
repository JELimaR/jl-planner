# ¿Qué es un Project?

Un **Project** es la entidad principal del sistema JL Planner. Representa un proyecto completo con todas sus tareas, hitos y procesos organizados de manera jerárquica.

## Características Principales

### Estructura Básica
- **ID único**: Identificador del proyecto (puede ser MongoDB ObjectId, "new", "loaded", etc.)
- **Título y Subtítulo**: Información descriptiva del proyecto
- **Fechas**: Fecha de inicio y fin calculadas automáticamente
- **Items**: Lista de todos los elementos que componen el proyecto

### Componentes Automáticos
Todo proyecto incluye automáticamente:

1. **RootProcess (ID: 1001)**: Proceso raíz que contiene todos los elementos
2. **Start Milestone (ID: 1000)**: Hito de inicio del proyecto
3. **End Milestone (ID: 1002)**: Hito de finalización del proyecto

### Funcionalidades

#### Gestión de Fechas
- **Fecha de Inicio**: Establecida manualmente o calculada automáticamente
- **Fecha de Fin**: Calculada en base a la duración total de todas las tareas
- **Recálculo Automático**: Las fechas se actualizan cuando se modifican los elementos

#### Gestión de Dependencias
- **Relaciones Automáticas**: Los elementos sin dependencias se conectan automáticamente al hito de inicio
- **Validación**: El sistema previene dependencias circulares
- **Propagación**: Los cambios en dependencias se propagan automáticamente

#### Caminos Críticos
- **Cálculo Automático**: Identifica automáticamente las rutas críticas del proyecto
- **Múltiples Caminos**: Puede tener varios caminos críticos simultáneamente
- **Actualización Dinámica**: Se recalculan cuando cambian las dependencias o duraciones

## Persistencia

### Tipos de Proyecto
- **Temporales**: IDs como "new", "loaded" o con prefijo "p"
- **Templates**: IDs con prefijo "t" 
- **Guardados**: IDs de MongoDB (24 caracteres hexadecimales)

### Base de Datos
Los proyectos pueden guardarse con metadatos adicionales:
- **ownerId**: Propietario del proyecto
- **isPublic**: Visibilidad pública
- **isTemplate**: Marcado como plantilla
- **Fechas de creación y modificación**

## Operaciones Principales

### Cálculo de Fechas
```typescript
calculateItemDates(): void
```
Recalcula todas las fechas del proyecto basándose en dependencias y duraciones.

### Gestión de Items
- **addItem()**: Agrega nuevos elementos al proyecto
- **editItem()**: Modifica elementos existentes
- **Validaciones**: Previene modificaciones que rompan la estructura

### Análisis del Proyecto
- **getCriticalPaths()**: Obtiene todos los caminos críticos
- **getDelayedItems()**: Identifica elementos con retrasos
- **getTotalProjectDelayInDays()**: Calcula el retraso total del proyecto

[← Volver al Índice](./index.md) | [Siguiente: ¿Qué es un Item? →](./item.md)