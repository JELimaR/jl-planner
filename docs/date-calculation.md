# Cálculo del Comienzo de cada Item

El sistema JL Planner calcula automáticamente las fechas de inicio y fin de cada elemento basándose en las dependencias, duraciones y la fecha de inicio del proyecto. Este proceso es fundamental para mantener la coherencia temporal del proyecto.

## Proceso General de Cálculo

### 1. Construcción del Grafo de Dependencias
El sistema construye un grafo dirigido donde:
- **Nodos**: Representan Tasks y Milestones (elementos terminales)
- **Aristas**: Representan dependencias entre elementos
- **Procesos**: Se expanden a sus elementos terminales

```typescript
const graph = DependencyGraph.fromProject(this);
```

### 2. Algoritmo de Cálculo
Se utiliza un algoritmo de programación hacia adelante (Forward Pass):
- **Inicio**: Desde el hito de inicio del proyecto
- **Propagación**: Las fechas se calculan siguiendo las dependencias
- **Validación**: Se verifica que no existan ciclos en las dependencias

## Reglas de Cálculo por Tipo

### Tasks (Tareas)
```typescript
// Fecha de inicio: máximo entre fecha calculada y fecha manual
getStartDate(): Date | undefined {
  return this.actualStartDate || this.calculatedStartDate;
}

// Fecha de fin: inicio + duración
getEndDate(): Date | undefined {
  const start = this.getStartDate();
  if (!start) return undefined;
  const end = new Date(start);
  end.setDate(end.getDate() + this.duration);
  return end;
}
```

**Reglas específicas:**
- Si tiene fecha manual (`actualStartDate`), se usa esa fecha
- Si no, se usa la fecha calculada (`calculatedStartDate`)
- La fecha de fin siempre es inicio + duración en días

### Milestones (Hitos)
```typescript
// Fecha única para inicio y fin
getStartDate(): Date | undefined {
  return this._actualStartDate || this._calculatedStartDate;
}

getEndDate(): Date | undefined {
  return this.getStartDate(); // Misma fecha
}
```

**Reglas específicas:**
- Los milestones no tienen duración (inicio = fin)
- Prioridad: fecha manual sobre calculada
- Representan puntos específicos en el tiempo

### Processes (Procesos)
```typescript
// Fecha de inicio: mínima entre todos los hijos
getStartDate(): Date | undefined {
  const startDates = this._children
    .map(child => child.getStartDate())
    .filter(d => !!d);
  return startDates.length 
    ? new Date(Math.min(...startDates.map(d => d.getTime())))
    : undefined;
}

// Fecha de fin: máxima entre todos los hijos
getEndDate(): Date | undefined {
  const endDates = this._children
    .map(child => child.getEndDate())
    .filter(d => !!d);
  return endDates.length
    ? new Date(Math.max(...endDates.map(d => d.getTime())))
    : undefined;
}
```

**Reglas específicas:**
- No tienen fechas propias, se calculan desde los hijos
- No se pueden establecer fechas manuales en procesos
- Se recalculan automáticamente cuando cambian los hijos

## Algoritmo de Cálculo Detallado

### 1. Preparación
```typescript
calculateItemDates(): void {
  this.updateRelations();
  const graph = DependencyGraph.fromProject(this);
  calculateDatesFromGraph(graph, this.projectStartDate);
}
```

### 2. Actualización de Relaciones
- Se verifican todas las dependencias del proyecto
- Se validan las relaciones padre-hijo
- Se propagan dependencias de procesos a sus hijos

### 3. Cálculo Forward Pass
El algoritmo procede en orden topológico:

#### Para cada nodo sin predecesores pendientes:
1. **Calcular fecha de inicio**:
   - Si no tiene predecesores: fecha de inicio del proyecto
   - Si tiene predecesores: máxima fecha de fin de todos los predecesores

2. **Calcular fecha de fin**:
   - Tasks: fecha de inicio + duración
   - Milestones: misma fecha de inicio

3. **Marcar como procesado** y continuar con sucesores

### 4. Validaciones Durante el Cálculo
- **Dependencias circulares**: Se detectan y previenen
- **Fechas coherentes**: Se verifica que fin >= inicio
- **Duraciones válidas**: Se asegura que las duraciones sean positivas

## Casos Especiales

### Elementos sin Dependencias
```typescript
// Se conectan automáticamente al hito de inicio
if (item.predecessors.size === 0) {
  this.addRelation(this.startMilestone, item);
}
```

### Elementos con Fechas Manuales
- **Prioridad**: Las fechas manuales siempre tienen prioridad
- **Propagación**: Los cambios manuales afectan a elementos dependientes
- **Validación**: Se verifica coherencia con dependencias

### Retrasos y Adelantos
```typescript
getDelayInDays(): number {
  if (!this.actualStartDate || !this.calculatedStartDate) return 0;
  const diff = this.actualStartDate.getTime() - this.calculatedStartDate.getTime();
  return Math.ceil(diff / DAY_MS);
}
```

## Recálculo Automático

### Triggers de Recálculo
El sistema recalcula fechas automáticamente cuando:
- Se agregan o eliminan elementos
- Se modifican dependencias
- Se cambian duraciones
- Se establecen fechas manuales
- Se modifica la fecha de inicio del proyecto

### Optimización
- **Cálculo incremental**: Solo se recalculan elementos afectados
- **Cache de resultados**: Se evitan cálculos redundantes
- **Validación lazy**: Las validaciones se realizan solo cuando es necesario

## Ejemplo Práctico

### Proyecto Simple
```
Start (1000) -> Tarea A (3 días) -> Tarea B (2 días) -> End (1002)
```

### Cálculo de Fechas
1. **Start**: 01/01/2024 (fecha del proyecto)
2. **Tarea A**: 
   - Inicio: 01/01/2024 (después de Start)
   - Fin: 04/01/2024 (inicio + 3 días)
3. **Tarea B**:
   - Inicio: 04/01/2024 (después de Tarea A)
   - Fin: 06/01/2024 (inicio + 2 días)
4. **End**: 06/01/2024 (después de Tarea B)

### Con Retraso Manual
Si Tarea A tiene fecha manual 03/01/2024:
1. **Tarea A**: 
   - Inicio: 03/01/2024 (fecha manual)
   - Fin: 06/01/2024 (manual + 3 días)
2. **Tarea B**:
   - Inicio: 06/01/2024 (después de Tarea A retrasada)
   - Fin: 08/01/2024 (inicio + 2 días)

[← Anterior: ¿Qué es un Task?](./task.md) | [Volver al Índice](./index.md) | [Siguiente: Camino Crítico →](./critical-path.md)