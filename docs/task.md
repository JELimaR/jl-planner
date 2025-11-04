# ¿Qué es un Task?

Un **Task** (tarea) es el tipo de Item que representa trabajo real que debe realizarse en el proyecto. Tiene duración específica y consume tiempo y recursos para completarse.

## Características Principales

### Duración
Las tareas tienen duración medida en días:
- **Duration**: Duración efectiva de la tarea
- **Calculada vs Manual**: Puede tener duración calculada automáticamente o establecida manualmente
- **Mínimo**: La duración mínima es siempre 1 día

### Gestión de Duración
```typescript
duration: number                    // Duración efectiva (manual o calculada)
setDuration(days: number): void     // Establece duración calculada
setManualDuration(days: number): void // Establece duración manual
```

La duración efectiva prioriza la manual si existe:
```typescript
get duration(): number {
  return this.manualDuration ?? this.calculatedDuration;
}
```

## Fechas en Tasks

### Fechas Calculadas
- **calculatedStartDate**: Fecha de inicio calculada por el sistema
- **calculatedEndDate**: Fecha de fin calculada (inicio + duración)
- **Automáticas**: Se actualizan cuando cambian dependencias o configuración

### Fechas Manuales (Actuales)
- **actualStartDate**: Fecha de inicio establecida manualmente
- **Prioridad**: Si existe, se usa en lugar de la calculada
- **Retrasos**: Permite modelar retrasos o adelantos reales

### Cálculo de Fechas de Fin
```typescript
getEndDate(): Date | undefined {
  const start = this.getStartDate();
  if (!start) return undefined;
  const end = new Date(start);
  end.setDate(end.getDate() + this.duration);
  return end;
}
```

## Cálculo de Retrasos

### Detección de Retrasos
```typescript
getDelayInDays(): number
```
Calcula días de retraso comparando fecha manual vs calculada:
- **Positivo**: Retraso (inicio real posterior al planificado)
- **Cero**: Sin retraso o sin fecha manual
- **Uso**: Para análisis de desempeño y seguimiento del proyecto

### Impacto de Retrasos
Los retrasos en tareas pueden:
- Afectar tareas dependientes
- Modificar el camino crítico
- Retrasar la fecha de fin del proyecto
- Generar costos adicionales

## Costos en Tasks

### Distribución Temporal
Las tareas distribuyen su costo según el método seleccionado:

#### Método 'linear'
```typescript
// Costo distribuido uniformemente durante la duración
return cost / durationInDays;
```

#### Método 'started'
```typescript
// Costo total pagado al iniciar
if (date.getTime() === startDate.getTime()) {
  return cost;
}
return 0;
```

#### Método 'finished'
```typescript
// Costo total pagado al finalizar
if (date.getTime() === endDate.getTime()) {
  return cost;
}
return 0;
```

### Casos de Uso por Método
- **Linear**: Salarios, alquileres, costos continuos
- **Started**: Compra de materiales, pagos iniciales
- **Finished**: Bonos por completar, pagos por entregables

## Validaciones y Restricciones

### Duración
- **Mínimo 1 día**: No se permiten duraciones menores a 1
- **Números positivos**: Solo se aceptan valores positivos
- **Actualización automática**: Los cambios recalculan fechas del proyecto

### Fechas Manuales
- **Opcional**: Las tareas pueden o no tener fecha manual de inicio
- **Flexibilidad**: Permite ajustar fechas según la realidad del proyecto
- **Validación**: Se verifica coherencia con dependencias

## Edición de Tasks

### Propiedades Editables
```typescript
edit(data: IItemData): void {
  super.edit(data);                    // Propiedades base
  const taskData = data as ITaskData;
  this.setDuration(taskData.duration); // Duración
  
  // Duración manual (opcional)
  if (taskData.manualDuration !== undefined) {
    this.setManualDuration(taskData.manualDuration);
  }
  
  // Fecha manual (opcional)
  if (taskData.actualStartDate) {
    this.setActualStartDate(displayStringToDate(taskData.actualStartDate));
  }
}
```

### Restricciones de Edición
- **Tipo**: No se puede cambiar de Task a otro tipo
- **ID**: No se puede modificar el identificador
- **Padre**: No se puede cambiar el proceso contenedor

## Serialización

### Datos Específicos
```typescript
interface ITaskData extends IItemData {
  type: 'task';
  duration: number;
  actualStartDate?: TDateString;
  calculatedStartDate?: TDateString;
  manualDuration?: number;
}
```

### Información Preservada
- **Duraciones**: Tanto calculada como manual
- **Fechas**: Calculada y manual si existe
- **Estado**: Toda la configuración de la tarea

## Casos de Uso Comunes

### Desarrollo de Software
```
- Análisis de Requisitos (5 días)
- Diseño de Base de Datos (3 días)
- Implementación de API (10 días)
- Pruebas Unitarias (4 días)
```

### Construcción
```
- Excavación (2 días)
- Cimentación (5 días)
- Estructura (15 días)
- Acabados (8 días)
```

### Marketing
```
- Investigación de Mercado (7 días)
- Diseño de Campaña (4 días)
- Producción de Contenido (6 días)
- Lanzamiento (1 día)
```

## Relación con Otros Elements

### Dependencias
- **Predecesores**: Otras tareas, milestones o procesos que deben completarse antes
- **Sucesores**: Elementos que dependen de esta tarea
- **Validación**: Se previenen dependencias circulares

### Procesos Padre
- **Contenedor**: Toda tarea pertenece a un proceso
- **Herencia**: Hereda dependencias del proceso padre
- **Agregación**: Su duración y costo contribuyen al proceso padre

[← Anterior: ¿Qué es un Milestone?](./milestone.md) | [Volver al Índice](./index.md) | [Siguiente: Cálculo de Fechas →](./date-calculation.md)