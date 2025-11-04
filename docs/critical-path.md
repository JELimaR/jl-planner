# Camino Crítico

El **Camino Crítico** es la secuencia más larga de actividades dependientes que determina la duración mínima del proyecto. Cualquier retraso en las actividades del camino crítico retrasa todo el proyecto.

## Concepto Fundamental

### Definición
Un camino crítico es una secuencia de elementos (Tasks y Milestones) desde el hito de inicio hasta el hito de fin donde:
- **Sin holgura**: No hay tiempo de espera entre actividades consecutivas
- **Dependencia directa**: Cada elemento comienza inmediatamente después de que termina su predecesor
- **Duración máxima**: Representa el tiempo mínimo necesario para completar el proyecto

### Características
- **Múltiples caminos**: Un proyecto puede tener varios caminos críticos simultáneamente
- **Dinámico**: Cambia cuando se modifican duraciones, dependencias o fechas
- **Impacto directo**: Los retrasos en estos elementos afectan la fecha de fin del proyecto

## Algoritmo de Cálculo

### 1. Preparación del Grafo
```typescript
getCriticalPaths(): CriticalPath[] {
  this.allItemsMap.forEach(item => item.resetCritical());
  const graph = DependencyGraph.fromProject(this);
  
  const paths = getCriticalPathsFromGraph(
    graph,
    this.startMilestone.id,
    this.endMilestone.id
  );
  
  // Marcar elementos como críticos
  paths.forEach(criticalPath => {
    criticalPath.path.forEach(item => {
      item.setCritical();
    });
  });
  
  return paths;
}
```

### 2. Identificación de Caminos
El algoritmo utiliza programación hacia atrás (Backward Pass):

#### Forward Pass (ya calculado)
- Calcula las fechas más tempranas de inicio y fin
- Establece la fecha de fin del proyecto

#### Backward Pass
- Desde el hito de fin hacia el inicio
- Calcula las fechas más tardías sin retrasar el proyecto
- Identifica elementos con holgura cero

#### Identificación de Críticos
```typescript
// Un elemento es crítico si:
// Fecha más temprana de inicio = Fecha más tardía de inicio
// Y
// Fecha más temprana de fin = Fecha más tardía de fin
```

### 3. Construcción de Caminos
- Se trazan todas las rutas desde inicio hasta fin
- Se incluyen solo elementos con holgura cero
- Se valida la continuidad de las dependencias

## Tipos de Elementos Críticos

### Tasks Críticas
```typescript
// Una tarea es crítica si:
// - Su retraso afecta directamente la fecha de fin del proyecto
// - No tiene holgura (slack = 0)
// - Forma parte de la secuencia más larga
```

**Características:**
- Cualquier aumento en su duración retrasa el proyecto
- No se pueden retrasar sin afectar el cronograma
- Requieren atención prioritaria en el seguimiento

### Milestones Críticos
```typescript
// Un milestone es crítico si:
// - Está en la ruta más larga del proyecto
// - Su retraso afecta elementos dependientes críticos
```

**Características:**
- Puntos de control fundamentales del proyecto
- Fechas que no se pueden mover sin impacto
- Hitos de entrega o aprobación clave

### Processes Críticos
Los procesos pueden ser críticos si contienen elementos críticos:
- Su fecha de inicio/fin está determinada por elementos críticos
- Cambios en su estructura afectan el camino crítico
- Requieren gestión especial de recursos

## Cálculo de Holgura

### Holgura Total
```typescript
// Holgura = Fecha más tardía de inicio - Fecha más temprana de inicio
// O equivalentemente:
// Holgura = Fecha más tardía de fin - Fecha más temprana de fin
```

### Interpretación
- **Holgura = 0**: Elemento crítico
- **Holgura > 0**: Elemento no crítico, puede retrasarse sin afectar el proyecto
- **Holgura < 0**: Situación problemática, indica retrasos ya existentes

## Múltiples Caminos Críticos

### Identificación
```typescript
interface CriticalPath {
  path: Item[];           // Secuencia de elementos críticos
  totalDelayDays: number; // Días de retraso total del camino
}
```

### Casos Comunes
1. **Caminos Paralelos**: Actividades independientes con la misma duración
2. **Convergencia**: Múltiples rutas que convergen en un punto crítico
3. **Divergencia**: Un elemento crítico que inicia múltiples rutas críticas

### Gestión
- **Monitoreo simultáneo**: Todos los caminos críticos requieren seguimiento
- **Recursos compartidos**: Conflictos potenciales entre caminos paralelos
- **Riesgo multiplicado**: Más caminos críticos = mayor riesgo de retraso

## Impacto de Retrasos

### Retrasos en Elementos Críticos
```typescript
getTotalProjectDelayInDays(): number {
  const projectEnd = this.getProjectEndDate();
  let maxActualEnd: Date | undefined = undefined;
  
  // Buscar la fecha de fin real más tardía
  for (const item of this.allItemsMap.values()) {
    if (item instanceof Task || item instanceof Milestone) {
      const actualEnd = item.getEndDate();
      if (actualEnd && (!maxActualEnd || actualEnd > maxActualEnd)) {
        maxActualEnd = actualEnd;
      }
    }
  }
  
  // Calcular retraso total del proyecto
  if (!maxActualEnd || maxActualEnd <= projectEnd) return 0;
  const delayMs = maxActualEnd.getTime() - projectEnd.getTime();
  return Math.ceil(delayMs / DAY_MS);
}
```

### Propagación de Retrasos
- **Efecto dominó**: Un retraso se propaga a todos los sucesores
- **Cambio de camino crítico**: Los retrasos pueden crear nuevos caminos críticos
- **Acortamiento**: Reducir duraciones en el camino crítico acelera el proyecto

## Visualización del Camino Crítico

### En el Diagrama de Gantt
```typescript
function isCritical(projectData: IProjectData, item: IItemData, criticalPathIndex: number): boolean {
  const criticalPaths = projectData.criticalPaths;
  
  if (criticalPathIndex === -1) {
    // Mostrar todos los caminos críticos
    return criticalPaths.some(path => 
      path.path.some(criticalItem => criticalItem.id === item.id)
    );
  }
  
  // Mostrar camino específico
  if (criticalPathIndex >= 0 && criticalPathIndex < criticalPaths.length) {
    const selectedPath = criticalPaths[criticalPathIndex];
    return selectedPath.path.some(criticalItem => criticalItem.id === item.id);
  }
  
  return false;
}
```

### Elementos Visuales
- **Color especial**: Elementos críticos se muestran en color diferente (rojo)
- **Flechas críticas**: Dependencias críticas se resaltan
- **Indicadores**: Marcas especiales para elementos sin holgura

## Estrategias de Gestión

### Monitoreo Continuo
- **Seguimiento diario**: Verificar progreso de elementos críticos
- **Alertas tempranas**: Detectar posibles retrasos antes de que ocurran
- **Reportes específicos**: Informes focalizados en el camino crítico

### Optimización
- **Compresión**: Reducir duraciones en el camino crítico
- **Paralelización**: Ejecutar actividades críticas en paralelo cuando sea posible
- **Recursos adicionales**: Asignar más recursos a actividades críticas

### Gestión de Riesgos
- **Identificación**: Elementos críticos son de alto riesgo
- **Contingencias**: Planes alternativos para elementos críticos
- **Buffers**: Tiempo adicional en elementos no críticos

## Ejemplo Práctico

### Proyecto de Desarrollo
```
Start -> Análisis (5d) -> Diseño (3d) -> Desarrollo (10d) -> Testing (4d) -> End
      -> Documentación (8d) ---------> Revisión (2d) ------>
```

### Análisis del Camino Crítico
1. **Camino 1**: Start → Análisis → Diseño → Desarrollo → Testing → End (22 días)
2. **Camino 2**: Start → Documentación → Revisión → End (10 días)

**Resultado**: Camino 1 es crítico (más largo)

### Impacto de Cambios
- **Retrasar Desarrollo +2 días**: Proyecto se retrasa 2 días
- **Retrasar Documentación +5 días**: No afecta el proyecto (holgura de 12 días)
- **Acelerar Testing -1 día**: Proyecto se acelera 1 día

[← Anterior: Cálculo de Fechas](./date-calculation.md) | [Volver al Índice](./index.md)