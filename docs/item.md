# ¿Qué es un Item?

Un **Item** es la clase base abstracta de la cual heredan todos los elementos que componen un proyecto: Tasks, Milestones y Processes. Define la estructura común y los comportamientos básicos que comparten todos los elementos.

## Propiedades Comunes

### Identificación
- **ID**: Número único que identifica el item dentro del proyecto
- **Tipo**: 'task', 'milestone' o 'process'
- **Nombre**: Descripción corta del elemento
- **Detalle**: Descripción extendida (opcional)

### Jerarquía
- **Parent**: Referencia al proceso padre que contiene este item
- **ParentId**: ID del proceso padre para serialización

### Dependencias
- **Predecessors**: Set de items que deben completarse antes que este
- **PredecessorIds**: Array de IDs para serialización

### Fechas (Abstractas)
Cada tipo de item implementa estas funciones de manera específica:
- **getStartDate()**: Fecha de inicio efectiva (manual o calculada)
- **getEndDate()**: Fecha de fin efectiva
- **getCalculatedStartDate()**: Fecha calculada automáticamente
- **getCalculatedEndDate()**: Fecha de fin calculada

### Costos
- **Cost**: Costo base del item
- **getTotalCost()**: Costo total (puede ser calculado diferente según el tipo)
- **getDailyCost()**: Costo distribuido por día según método de gasto

## Comportamientos Comunes

### Gestión de Estado
- **isCritical**: Indica si el item forma parte del camino crítico
- **setCritical() / resetCritical()**: Métodos para marcar/desmarcar como crítico

### Fechas Manuales vs Calculadas
- **setActualStartDate()**: Establece fecha manual de inicio
- **setCalculatedStartDate()**: Establece fecha calculada por el sistema
- **hasActualStartDate()**: Verifica si tiene fecha manual
- **getDelayInDays()**: Calcula días de retraso respecto a lo planificado

### Edición
- **edit()**: Método para modificar propiedades del item
- **forceSetId()**: Cambio forzado de ID (uso interno, peligroso)

## Métodos de Costo

### Distribución Temporal
El sistema soporta diferentes métodos para distribuir costos en el tiempo:

- **'finished'**: El costo se paga completamente al finalizar
- **'started'**: El costo se paga completamente al iniciar  
- **'linear'**: El costo se distribuye uniformemente durante la duración

### Implementación por Tipo
Cada tipo de item implementa `getDailyCost()` de manera específica:
- **Tasks**: Distribuye según duración y método seleccionado
- **Milestones**: Paga el costo total en la fecha de inicio
- **Processes**: Suma los costos de sus hijos o usa costo manual

## Serialización

### Conversión a Datos
Cada item puede convertirse a un objeto `IItemData` que contiene:
- Todas las propiedades serializables
- Fechas formateadas como strings
- IDs de dependencias como array
- Información de jerarquía

### Deserialización
El sistema puede reconstruir items desde datos serializados manteniendo:
- Todas las relaciones de dependencia
- La estructura jerárquica
- Las fechas y configuraciones

## Validaciones

### Restricciones de Edición
- **Tipo**: No se puede cambiar el tipo de un item existente
- **Padre**: No se puede cambiar el proceso padre
- **ID**: Solo modificable internamente con `forceSetId()`

### Dependencias
- **Prevención de Ciclos**: El sistema valida que no se creen dependencias circulares
- **Coherencia**: Las dependencias deben ser válidas dentro del contexto del proyecto

[← Anterior: ¿Qué es un Project?](./project.md) | [Volver al Índice](./index.md) | [Siguiente: ¿Qué es un Process? →](./process.md)