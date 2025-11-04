# ¿Qué es un Process y el RootProcess?

Un **Process** es un tipo especial de Item que actúa como contenedor de otros elementos (Tasks, Milestones u otros Processes). Permite organizar el proyecto de manera jerárquica y agrupar elementos relacionados.

## Características Principales

### Contenedor Jerárquico
- **Children**: Array de items que pertenecen a este proceso
- **Anidamiento**: Los procesos pueden contener otros procesos creando una estructura de árbol
- **Herencia de Dependencias**: Los hijos heredan automáticamente las dependencias del proceso padre

### Fechas Calculadas
Los procesos no tienen fechas propias, sino que las calculan basándose en sus hijos:
- **Fecha de Inicio**: La fecha más temprana entre todos sus hijos
- **Fecha de Fin**: La fecha más tardía entre todos sus hijos
- **Sin Fechas Manuales**: No se pueden establecer fechas manuales en procesos

### Gestión de Costos
Los procesos ofrecen dos modalidades para el manejo de costos:

#### Costo Calculado (por defecto)
- **useManualCost = false**
- El costo total es la suma de los costos de todos sus hijos
- Se actualiza automáticamente cuando cambian los hijos

#### Costo Manual
- **useManualCost = true** 
- Se establece un costo fijo independiente de los hijos
- Útil para gastos generales o costos administrativos del proceso

## RootProcess

### Proceso Especial
El **RootProcess** es un proceso único con características especiales:
- **ID Fijo**: Siempre tiene el ID 1001
- **Nombre**: "Project Root Process"
- **Contenedor Principal**: Contiene todos los elementos de primer nivel del proyecto
- **Hitos Automáticos**: Incluye automáticamente los hitos de inicio (1000) y fin (1002)

### Comportamiento Especial
- **Punto de Entrada**: Todos los elementos sin dependencias se conectan al hito de inicio
- **Punto de Salida**: Todos los elementos se conectan automáticamente al hito de fin
- **Gestión Automática**: El sistema gestiona automáticamente estas conexiones

## Operaciones con Procesos

### Gestión de Hijos
```typescript
addChild(item: Item): void        // Agrega un hijo al proceso
removeChild(id: number): boolean // Elimina un hijo por ID
```

### Propagación de Dependencias
Cuando se agrega una dependencia a un proceso:
- Se propaga automáticamente a todos sus hijos
- Los hijos no pueden tener como predecesor a elementos que ya están dentro del proceso
- Se valida que no se creen dependencias circulares

### Items Terminales
```typescript
getTerminalItems(): Item[]
```
Obtiene todos los elementos "hoja" (Tasks y Milestones) contenidos en el proceso, útil para:
- Construcción de grafos de dependencias
- Cálculos de camino crítico
- Análisis de la estructura del proyecto

## Restricciones y Validaciones

### Fechas
- **No Manuales**: Los procesos no pueden tener fechas de inicio manuales
- **Solo Calculadas**: Las fechas se derivan siempre de los hijos
- **Error en Asignación**: Lanza error si se intenta asignar fecha manual

### Estructura
- **Validación de Padres**: Los hijos deben tener el proceso como padre
- **Prevención de Ciclos**: No se pueden crear dependencias que generen ciclos
- **Coherencia**: Se mantiene la integridad de la estructura jerárquica

## Serialización de Procesos

### Estructura Recursiva
Los procesos se serializan incluyendo:
- Todas sus propiedades base (heredadas de Item)
- **children**: Array recursivo con todos los hijos serializados
- **useManualCost**: Configuración del modo de costo

### Deserialización
Durante la reconstrucción:
- Se crean primero todos los procesos
- Se agregan los hijos recursivamente
- Se restauran las dependencias al final para evitar referencias rotas

## Casos de Uso

### Organización por Fases
```
RootProcess (1001)
├── Fase de Análisis (Process)
│   ├── Reunión con cliente (Task)
│   └── Documentación de requisitos (Task)
├── Fase de Desarrollo (Process)
│   ├── Diseño de arquitectura (Task)
│   └── Implementación (Task)
└── Fase de Testing (Process)
    ├── Pruebas unitarias (Task)
    └── Pruebas de integración (Task)
```

### Organización por Equipos
```
RootProcess (1001)
├── Equipo Frontend (Process)
├── Equipo Backend (Process)
└── Equipo QA (Process)
```

[← Anterior: ¿Qué es un Item?](./item.md) | [Volver al Índice](./index.md) | [Siguiente: ¿Qué es un Milestone? →](./milestone.md)