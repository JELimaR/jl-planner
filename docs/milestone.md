# ¿Qué es un Milestone?

Un **Milestone** (hito) es un tipo de Item que representa un punto específico en el tiempo del proyecto. No tiene duración propia y marca eventos importantes, entregas o puntos de control.

## Características Principales

### Duración Cero
- **Sin Duración**: Los milestones no tienen duración, representan un momento específico
- **Fecha Única**: La fecha de inicio y fin son la misma
- **Punto en el Tiempo**: Marcan eventos instantáneos en el proyecto

### Fechas
Los milestones manejan dos tipos de fechas:

#### Fecha Calculada
- **calculatedStartDate**: Fecha calculada automáticamente por el sistema
- **Basada en Dependencias**: Se calcula según cuándo terminan sus predecesores
- **Actualización Automática**: Se recalcula cuando cambian las dependencias

#### Fecha Manual (Actual)
- **actualStartDate**: Fecha establecida manualmente
- **Prioridad**: Si existe, se usa en lugar de la calculada
- **Retrasos**: Permite modelar retrasos o adelantos respecto a lo planificado

### Gestión de Fechas
```typescript
getStartDate(): Date | undefined     // Fecha efectiva (manual o calculada)
getEndDate(): Date | undefined       // Misma que getStartDate()
setActualStartDate(date: Date): void // Establece fecha manual
setCalculatedStartDate(date: Date): void // Establece fecha calculada
```

## Tipos Especiales de Milestones

### Start Milestone (ID: 1000)
- **Hito de Inicio**: Marca el comienzo del proyecto
- **Dependencia Automática**: Elementos sin dependencias se conectan automáticamente a este hito
- **Fecha del Proyecto**: Su fecha determina la fecha de inicio del proyecto

### End Milestone (ID: 1002)
- **Hito de Fin**: Marca la finalización del proyecto
- **Conexión Automática**: Todos los elementos se conectan automáticamente a este hito
- **Fecha del Proyecto**: Su fecha determina la fecha de fin del proyecto

## Cálculo de Retrasos

### Detección de Retrasos
```typescript
getDelayInDays(): number
```
Calcula la diferencia en días entre la fecha manual y la calculada:
- **Positivo**: Indica retraso (fecha manual posterior a la calculada)
- **Cero**: Sin retraso o sin fecha manual
- **Negativo**: Adelanto (fecha manual anterior a la calculada)

### Impacto en el Proyecto
Los retrasos en milestones pueden:
- Afectar el camino crítico del proyecto
- Retrasar elementos dependientes
- Modificar la fecha de fin del proyecto

## Costos en Milestones

### Distribución de Costo
Los milestones pagan su costo completo en su fecha de inicio:
```typescript
getDailyCost(date: Date, method: SpendingMethod): number
```
- **En la fecha**: Retorna el costo total del milestone
- **Fuera de la fecha**: Retorna 0
- **Independiente del método**: El método de gasto no afecta a los milestones

### Casos de Uso para Costos
- **Pagos por entregables**: Costo asociado a la entrega de un hito
- **Bonificaciones**: Pagos por cumplir fechas específicas
- **Penalizaciones**: Costos por retrasos en hitos críticos

## Validaciones y Restricciones

### Fechas Manuales
- **Opcional**: Los milestones pueden o no tener fecha manual
- **Prioridad**: La fecha manual siempre tiene prioridad sobre la calculada
- **Flexibilidad**: Permite modelar situaciones reales donde las fechas se ajustan

### Dependencias
- **Como Predecesor**: Otros elementos pueden depender de milestones
- **Como Sucesor**: Los milestones pueden depender de otros elementos
- **Validación**: Se previenen dependencias circulares

## Casos de Uso Comunes

### Hitos de Entrega
```
- Entrega de Prototipo (Milestone)
- Aprobación del Cliente (Milestone)  
- Lanzamiento a Producción (Milestone)
```

### Puntos de Control
```
- Revisión de Arquitectura (Milestone)
- Checkpoint de Calidad (Milestone)
- Reunión de Seguimiento (Milestone)
```

### Eventos Externos
```
- Fecha Límite Legal (Milestone)
- Evento de Marketing (Milestone)
- Disponibilidad de Recursos (Milestone)
```

## Serialización

### Datos Específicos
Los milestones se serializan con:
```typescript
interface IMilestoneData extends IItemData {
  type: 'milestone';
  calculatedStartDate?: TDateString;
  actualStartDate?: TDateString;
}
```

### Información Preservada
- **Fechas**: Tanto calculada como manual se preservan
- **Dependencias**: Se mantienen todas las relaciones
- **Configuración**: Se preserva toda la configuración del milestone

[← Anterior: ¿Qué es un Process?](./process.md) | [Volver al Índice](./index.md) | [Siguiente: ¿Qué es un Task? →](./task.md)