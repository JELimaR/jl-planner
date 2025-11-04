import { ref } from 'vue'

export const useDocumentation = () => {
  const pages = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Contenido de documentación embebido
  const documentationContent = {
    index: `# Documentación del Sistema

Sistema de gestión de proyectos basado en diagramas de Gantt con cálculo automático de cronogramas y análisis de camino crítico.

## Funcionalidades Principales

El sistema implementa:
- **Planificación de proyectos** mediante estructura jerárquica de elementos
- **Visualización de cronogramas** con diagramas de Gantt
- **Gestión de dependencias** entre actividades con validación de ciclos
- **Cálculo automático de fechas** basado en algoritmos de programación de proyectos
- **Análisis de camino crítico** para identificación de actividades críticas

## Índice de Contenidos

- [¿Qué es un Proyecto?](#project)
- [¿Qué son los Elementos?](#item)
- [¿Qué son los Procesos?](#process)
- [¿Qué son los Hitos?](#milestone)
- [¿Qué son las Tareas?](#task)
- [¿Cómo se calculan las fechas?](#date-calculation)
- [¿Qué es el Camino Crítico?](#critical-path)

## Arquitectura del Sistema

### Modelo de Datos
El sistema utiliza una estructura jerárquica donde:
- **Proyecto**: Contenedor raíz con metadatos y configuración
- **Procesos**: Nodos contenedores que agrupan elementos relacionados
- **Tareas**: Nodos terminales que representan trabajo con duración
- **Hitos**: Nodos terminales que representan eventos puntuales

### Algoritmos de Cálculo
- **Forward Pass**: Cálculo de fechas más tempranas de inicio y fin
- **Backward Pass**: Cálculo de fechas más tardías y holguras
- **Detección de camino crítico**: Identificación de secuencias sin holgura
- **Validación de dependencias**: Prevención de ciclos mediante análisis topológico

## Navegación

Utiliza la barra lateral para acceder a la documentación detallada de cada componente del sistema.`,

    project: `# ¿Qué es un Proyecto?

Un **Proyecto** es la entidad de nivel superior que encapsula todos los elementos de trabajo, sus relaciones y metadatos asociados.

## Estructura de Datos

### Metadatos del Proyecto
- **Identificador**: ID único del proyecto
- **Título y descripción**: Información descriptiva
- **Fecha de inicio**: Fecha base para cálculos de cronograma
- **Fecha de fin**: Calculada automáticamente mediante algoritmos de programación

### Elementos Contenidos
Estructura jerárquica que incluye:
- **Procesos**: Nodos contenedores para agrupación lógica
- **Tareas**: Nodos terminales con duración y recursos
- **Hitos**: Nodos terminales que representan eventos o entregas

## Funcionamiento del Sistema

### Inicialización Automática
El sistema genera automáticamente:
- **Nodo de inicio**: Milestone inicial para elementos sin dependencias
- **Nodo de finalización**: Milestone final para cierre del proyecto
- **Proceso raíz**: Contenedor principal de todos los elementos

### Motor de Cálculo
Algoritmos implementados:
- **Programación hacia adelante**: Cálculo de fechas más tempranas
- **Análisis de dependencias**: Validación de relaciones y detección de ciclos
- **Cálculo de holguras**: Determinación de márgenes de tiempo disponibles

### Gestión de Estado
Capacidades de seguimiento:
- **Estados de elementos**: No iniciado, en progreso, completado
- **Fechas reales vs planificadas**: Comparación para análisis de desviaciones
- **Recálculo dinámico**: Actualización automática ante cambios

## Tipos de Instancias

### Proyectos Temporales
Instancias en memoria para:
- Creación y edición sin persistencia
- Pruebas de configuración
- Importación desde archivos externos

### Plantillas
Estructuras reutilizables que permiten:
- Estandarización de procesos
- Clonación de configuraciones
- Reducción de tiempo de configuración inicial

### Proyectos Persistentes
Instancias almacenadas con:
- Persistencia en base de datos
- Control de acceso y permisos
- Capacidades de colaboración y exportación

## Consideraciones de Implementación

### Configuración Inicial
1. **Definición de alcance**: Establecer límites y objetivos del proyecto
2. **Descomposición estructural**: Dividir en procesos y tareas
3. **Mapeo de dependencias**: Establecer relaciones entre elementos
4. **Estimación de duraciones**: Asignar tiempos a tareas

### Mantenimiento del Sistema
- **Actualización de estado**: Sincronización regular con progreso real
- **Validación de datos**: Verificación de coherencia en fechas y dependencias
- **Análisis de desviaciones**: Comparación entre planificado y real

---

**Navegación:** [← Inicio](#index) | [Siguiente: ¿Qué son los Elementos? →](#item)`,

    item: `# ¿Qué son los Elementos?

Los **Elementos** son las entidades básicas del modelo de datos que implementan una jerarquía de herencia con comportamientos polimórficos según su tipo.

## Taxonomía de Elementos

El sistema define tres tipos de elementos:

### Procesos (Nodos Contenedores)
Elementos que agrupan otros elementos formando una estructura jerárquica
- **Función**: Organización lógica y cálculo agregado de propiedades
- **Características**: Fechas calculadas, costos agregados, dependencias heredadas

### Tareas (Nodos Terminales con Duración)  
Elementos que representan trabajo con consumo de tiempo y recursos
- **Función**: Unidad básica de trabajo con duración específica
- **Características**: Duración configurable, fechas calculables, costos asignables

### Hitos (Nodos Terminales Puntuales)
Elementos que representan eventos o entregas sin duración
- **Función**: Marcadores temporales para control y seguimiento
- **Características**: Duración cero, fechas específicas, puntos de control

## Propiedades Base

Todos los elementos implementan la interfaz común:

### Metadatos
- **ID**: Identificador único numérico
- **Nombre**: String descriptivo del elemento
- **Descripción**: Texto opcional con detalles adicionales
- **Tipo**: Enumeración que define el comportamiento (task|milestone|process)

### Propiedades Temporales
- **Fechas calculadas**: Determinadas por algoritmos de programación
- **Fechas manuales**: Establecidas por el usuario (override del cálculo)
- **Duración**: Aplicable solo a tareas (días de trabajo)

### Relaciones
- **Jerarquía**: Referencia al proceso padre (parentId)
- **Dependencias**: Array de IDs de elementos predecesores
- **Costos**: Valor numérico opcional para análisis económico

## Algoritmos de Cálculo Temporal

### Fechas Calculadas (Automáticas)
El motor de cálculo determina fechas mediante:
- **Análisis de dependencias**: Evaluación de relaciones entre elementos
- **Propagación temporal**: Cálculo secuencial basado en duraciones
- **Fecha base del proyecto**: Punto de referencia inicial para todos los cálculos

### Fechas Manuales (Override)
Capacidad de establecer fechas específicas que:
- **Sobrescriben el cálculo automático**: Prioridad sobre fechas calculadas
- **Propagan cambios**: Recálculo automático de elementos dependientes
- **Mantienen coherencia**: Validación de consistencia temporal

El sistema recalcula automáticamente el impacto de cambios manuales en la red de dependencias.

## Gestión de Costos

### Asignación de Costos
Puedes asignar costos a cualquier elemento:
- **Tareas**: Costo del trabajo específico
- **Hitos**: Pagos por entregas
- **Procesos**: Costos generales de la fase

### Distribución en el Tiempo
Puedes elegir cómo se distribuye el costo:
- **Al inicio**: Se paga todo al comenzar
- **Al final**: Se paga todo al terminar  
- **Distribuido**: Se reparte durante toda la duración

## Dependencias entre Elementos

### ¿Qué son las Dependencias?
Las dependencias definen el orden en que deben realizarse las actividades.

**Ejemplo práctico:**
- No puedes pintar una pared antes de construirla
- No puedes entregar un producto antes de fabricarlo
- No puedes instalar software antes de comprar el hardware

### Cómo Funcionan
1. **Defines la relación**: "B depende de A"
2. **El sistema calcula**: B no puede comenzar hasta que A termine
3. **Se actualiza automáticamente**: Si A se retrasa, B también se retrasa

### Validaciones
La Herramienta previene errores comunes:
- **Dependencias circulares**: A depende de B, y B depende de A
- **Dependencias imposibles**: Fechas que no tienen sentido

## Estado de los Elementos

### Elementos Críticos
Algunos elementos son **críticos** porque:
- Su retraso afecta la fecha final del proyecto
- No tienen margen de error (holgura)
- Requieren atención especial

La Herramienta los marca automáticamente para que los identifiques fácilmente.

### Seguimiento del Progreso
Para cada elemento puedes:
- **Marcar como completado**
- **Actualizar el progreso** (25%, 50%, 75%, etc.)
- **Ajustar fechas reales** si hay cambios
- **Ver el impacto** en otros elementos

## Consejos Prácticos

### Al Crear Elementos
1. **Usa nombres descriptivos**: "Diseñar logo" es mejor que "Diseño"
2. **Agrupa lógicamente**: Pon tareas relacionadas en el mismo proceso
3. **Define dependencias claras**: Piensa en qué debe terminar antes

### Al Gestionar
- **Revisa regularmente**: Actualiza el estado semanalmente
- **Comunica cambios**: Informa al equipo sobre retrasos
- **Usa los hitos**: Marca entregas importantes para hacer seguimiento

---

**Navegación:** [← Anterior: ¿Qué es un Proyecto?](#project) | [Inicio](#index) | [Siguiente: ¿Qué son los Procesos? →](#process)`,

    process: `# ¿Qué son los Procesos?

Los **Procesos** son contenedores que te ayudan a organizar tu proyecto en fases o etapas lógicas. Piensa en ellos como carpetas que agrupan actividades relacionadas.

## ¿Para qué sirven los Procesos?

### Organización Clara
Los procesos te permiten:
- **Agrupar tareas relacionadas** (ej: todas las tareas de "Diseño" juntas)
- **Dividir proyectos grandes** en fases manejables
- **Ver el progreso por etapas** de manera visual
- **Asignar responsabilidades** por área o equipo

### Ejemplos Prácticos

**Proyecto de Construcción:**
- 🏗️ Proceso: "Cimentación"
  - Tarea: Excavación
  - Tarea: Colocación de hierros
  - Tarea: Vaciado de concreto

**Proyecto de Software:**
- 💻 Proceso: "Desarrollo"
  - Tarea: Programación del backend
  - Tarea: Diseño de interfaz
  - Tarea: Pruebas de funcionamiento

## ¿Cómo Funcionan?

### Fechas Automáticas
Los procesos no tienen fechas fijas. Sus fechas se calculan automáticamente:
- **Fecha de inicio**: Cuando comienza la primera tarea del proceso
- **Fecha de fin**: Cuando termina la última tarea del proceso

**Ejemplo:**
Si un proceso "Diseño" contiene:
- Tarea A: del 1 al 5 de enero
- Tarea B: del 3 al 8 de enero

El proceso "Diseño" será: del 1 al 8 de enero (automáticamente)

### Anidamiento de Procesos
Puedes crear procesos dentro de otros procesos:

**Ejemplo de Proyecto de Marketing:**
- 📢 Proceso Principal: "Campaña Publicitaria"
  - 🎨 Subproceso: "Creatividad"
    - Tarea: Diseño de logo
    - Tarea: Creación de slogan
  - 📺 Subproceso: "Medios"
    - Tarea: Compra de espacios TV
    - Tarea: Publicación en redes

## Gestión de Costos

### Costo Automático
Por defecto, el costo de un proceso es la suma de todos sus elementos:
- Si las tareas del proceso cuestan $100, $200 y $150
- El proceso costará $450 automáticamente

### Costo Manual
También puedes asignar un costo fijo al proceso:
- Útil para gastos generales (administración, supervisión)
- Se suma al costo de las tareas individuales
- **Ejemplo**: Proceso "Construcción" + $500 de supervisión

## Dependencias en Procesos

### Cómo Funcionan
Cuando un proceso depende de otro:
- **Todas las tareas del segundo proceso** deben terminar
- **Antes de que comience cualquier tarea del primer proceso**

**Ejemplo:**
- Proceso "Construcción" depende de Proceso "Diseño"
- Significa: Todas las tareas de diseño deben terminar antes de comenzar cualquier construcción

### Herencia de Dependencias
Las tareas dentro de un proceso heredan automáticamente las dependencias del proceso:
- Si el Proceso B depende del Proceso A
- Todas las tareas del Proceso B esperarán a que termine el Proceso A

## El Proceso Principal

### ¿Qué es?
Cada proyecto tiene un proceso principal invisible que:
- **Contiene todos los demás elementos** del proyecto
- **Gestiona el inicio y fin** del proyecto automáticamente
- **Conecta elementos sueltos** para mantener la coherencia

### Puntos de Control Automáticos
El sistema crea automáticamente:
- **Punto de Inicio**: Donde comienza el proyecto
- **Punto de Finalización**: Donde termina el proyecto
- **Conexiones automáticas**: Para elementos sin dependencias claras

## Consejos Prácticos

### Al Crear Procesos
1. **Agrupa por lógica**: Pon juntas las tareas que están relacionadas
2. **Usa nombres claros**: "Fase de Pruebas" es mejor que "Proceso 1"
3. **No hagas procesos muy pequeños**: Si solo tiene 1-2 tareas, quizás no necesitas el proceso
4. **Piensa en responsabilidades**: Un proceso por equipo o área funciona bien

### Al Gestionar
- **Revisa el progreso por proceso**: Es más fácil ver avances por etapas
- **Comunica por fases**: Reporta "Terminamos el diseño, comenzamos construcción"
- **Usa para planificación**: "¿Cuánto falta para terminar esta fase?"

### Errores Comunes
- **Procesos muy granulares**: No necesitas un proceso para cada tarea
- **Mezclar responsabilidades**: Un proceso debería tener un responsable claro
- **Dependencias confusas**: Mantén las dependencias entre procesos simples

---

**Navegación:** [← Anterior: ¿Qué son los Elementos?](#item) | [Inicio](#index) | [Siguiente: ¿Qué son los Hitos? →](#milestone)`,

    milestone: `# ¿Qué son los Hitos?

Los **Hitos** son fechas importantes en tu proyecto que marcan entregas clave, decisiones importantes o puntos de control. No representan trabajo, sino momentos específicos en el tiempo.

## ¿Para qué sirven los Hitos?

### Puntos de Control
Los hitos te ayudan a:
- **Marcar entregas importantes** (ej: "Entrega del prototipo")
- **Establecer fechas límite** (ej: "Fecha máxima de aprobación")
- **Celebrar logros** (ej: "Lanzamiento del producto")
- **Sincronizar con eventos externos** (ej: "Feria comercial")

### Ejemplos Prácticos

**Proyecto de Construcción:**
- 🏁 "Aprobación de planos"
- 🏁 "Finalización de cimentación"
- 🏁 "Entrega de llaves"

**Proyecto de Marketing:**
- 🏁 "Aprobación de campaña"
- 🏁 "Lanzamiento en medios"
- 🏁 "Evaluación de resultados"

## Características de los Hitos

### Sin Duración
Los hitos son **instantáneos**:
- No tienen duración (0 días)
- Representan un momento específico
- Su fecha de inicio y fin es la misma

**Piénsalo así:**
- Una tarea es como "construir una pared" (toma tiempo)
- Un hito es como "entregar las llaves" (sucede en un momento)

### Fechas Flexibles
Los hitos pueden tener:

#### Fecha Calculada
- El sistema calcula cuándo debería ocurrir
- Basándose en cuándo terminan las actividades anteriores
- Se actualiza automáticamente si algo cambia

#### Fecha Fija
- Puedes establecer una fecha específica
- Útil para fechas límite o eventos externos
- **Ejemplo**: "La feria es el 15 de marzo, no se puede mover"

## Tipos de Hitos

### Hitos de Entrega
Marcan cuando entregas algo:
- "Entrega del diseño final"
- "Presentación a cliente"
- "Lanzamiento del producto"

### Hitos de Aprobación
Marcan decisiones importantes:
- "Aprobación del presupuesto"
- "Visto bueno del cliente"
- "Autorización para continuar"

### Hitos de Control
Puntos de revisión del proyecto:
- "Revisión de avance mensual"
- "Evaluación de calidad"
- "Checkpoint de presupuesto"

### Hitos Externos
Eventos fuera de tu control:
- "Inicio del año fiscal"
- "Feria comercial"
- "Fecha límite legal"

## Seguimiento de Hitos

### Estados de un Hito
- **Pendiente**: Aún no se ha alcanzado
- **Alcanzado**: Se cumplió en la fecha planificada
- **Retrasado**: Se cumplió después de lo planificado
- **Adelantado**: Se cumplió antes de lo planificado

## Consejos Prácticos

### Al Crear Hitos
1. **Usa nombres claros**: "Entrega de prototipo funcional" es mejor que "Hito 1"
2. **Hazlos verificables**: Debe ser claro cuándo se cumple
3. **No abuses**: Solo para eventos realmente importantes
4. **Piensa en el impacto**: ¿Qué pasa si este hito se retrasa?

### Al Gestionar
- **Comunica claramente**: Los hitos son excelentes para reportes
- **Celebra los logros**: Reconoce cuando se alcanzan hitos importantes
- **Aprende de los retrasos**: ¿Por qué se retrasó? ¿Cómo evitarlo?

---

**Navegación:** [← Anterior: ¿Qué son los Procesos?](#process) | [Inicio](#index) | [Siguiente: ¿Qué son las Tareas? →](#task)`,

    task: `# ¿Qué son las Tareas?

Las **Tareas** representan el trabajo real que debe realizarse en tu proyecto. Son las actividades específicas que consumen tiempo y recursos para completarse.

## ¿Qué son las Tareas?

### Trabajo Real
Las tareas son actividades concretas como:
- "Diseñar el logo de la empresa"
- "Instalar las ventanas del segundo piso"
- "Escribir el código del módulo de usuarios"
- "Comprar los materiales de construcción"

### Características Principales
Cada tarea tiene:
- **Nombre descriptivo**: Qué trabajo se va a realizar
- **Duración**: Cuántos días tomará completarla
- **Fechas**: Cuándo comienza y cuándo termina
- **Costo**: Cuánto dinero requiere (opcional)
- **Dependencias**: Qué debe terminar antes de comenzar

## Duración de las Tareas

### ¿Cómo se mide?
La duración se mide en **días de trabajo**:
- **Mínimo**: 1 día (no hay tareas de menos de un día)
- **Ejemplo**: "Pintar la sala" = 2 días
- **Ejemplo**: "Revisar documentos" = 1 día

### Duración Estimada vs Real
Puedes manejar dos tipos de duración:

#### Duración Estimada
- Lo que **planeas** que tome la tarea
- Se usa para la planificación inicial
- **Ejemplo**: Estimas que pintar tomará 2 días

#### Duración Real
- Lo que **realmente** tomó la tarea
- Se actualiza durante la ejecución
- **Ejemplo**: Pintar realmente tomó 3 días por complicaciones

## Fechas de las Tareas

### Fechas Calculadas Automáticamente
La Herramienta calcula cuándo puede comenzar cada tarea:
- **Basándose en dependencias**: Qué debe terminar antes
- **Considerando la duración**: Cuánto tiempo tomará
- **Actualizándose automáticamente**: Si algo cambia, se recalcula

**Ejemplo:**
- Tarea A: "Comprar pintura" (1 día)
- Tarea B: "Pintar pared" (2 días, depende de A)
- Si A comienza el lunes, B puede comenzar el martes

### Fechas Manuales
También puedes establecer fechas específicas:
- **Fecha fija de inicio**: "Esta tarea debe comenzar el 15 de marzo"
- **Útil para**: Citas, entregas, disponibilidad de recursos
- **El sistema ajusta**: Las demás fechas se recalculan automáticamente

## Dependencias entre Tareas

### ¿Qué son las Dependencias?
Las dependencias definen qué debe terminar antes de que una tarea pueda comenzar.

**Ejemplos comunes:**
- "Instalar ventanas" depende de "Construir paredes"
- "Pintar" depende de "Comprar pintura"
- "Probar software" depende de "Programar funcionalidad"

### Cómo Funcionan
1. **Defines la relación**: Tarea B depende de Tarea A
2. **El sistema calcula**: B no puede comenzar hasta que A termine
3. **Se actualiza automáticamente**: Si A se retrasa, B también se retrasa

## Gestión de Costos

### Asignación de Costos
Puedes asignar costos a las tareas:
- **Materiales**: Costo de los insumos necesarios
- **Mano de obra**: Costo del personal
- **Servicios**: Costo de servicios externos
- **Equipos**: Costo de alquiler o compra de equipos

### Distribución del Costo
Puedes elegir cuándo se "gasta" el dinero:

#### Al Comenzar
- Se paga todo el costo cuando inicia la tarea
- **Útil para**: Compra de materiales, pagos iniciales

#### Al Terminar
- Se paga todo el costo cuando termina la tarea
- **Útil para**: Pagos por entrega, bonificaciones

#### Distribuido
- Se reparte el costo durante toda la duración
- **Útil para**: Salarios, alquileres, costos continuos

## Seguimiento del Progreso

### Estados de una Tarea
- **No iniciada**: Aún no ha comenzado
- **En progreso**: Se está ejecutando actualmente
- **Completada**: Ya terminó
- **Retrasada**: Comenzó o terminó después de lo planificado

### Actualización del Progreso
Puedes actualizar:
- **Porcentaje completado**: 25%, 50%, 75%, 100%
- **Fecha real de inicio**: Cuándo realmente comenzó
- **Fecha real de fin**: Cuándo realmente terminó
- **Duración real**: Cuánto tiempo realmente tomó

## Consejos Prácticos

### Al Crear Tareas
1. **Sé específico**: "Pintar sala principal" es mejor que "Pintar"
2. **Estima realísticamente**: Considera posibles complicaciones
3. **Define dependencias claras**: ¿Qué debe terminar antes?
4. **Asigna responsables**: ¿Quién hará esta tarea?

### Al Gestionar
- **Actualiza regularmente**: Revisa el progreso semanalmente
- **Comunica retrasos**: Informa temprano si algo se atrasa
- **Aprende de la experiencia**: ¿Las estimaciones fueron correctas?
- **Celebra completaciones**: Reconoce cuando se terminan tareas importantes

### Errores Comunes
- **Tareas muy grandes**: Divide tareas de más de 5-10 días
- **Dependencias olvidadas**: Revisa qué necesita cada tarea
- **Estimaciones optimistas**: Considera siempre posibles problemas
- **Falta de seguimiento**: Actualiza el progreso regularmente

---

**Navegación:** [← Anterior: ¿Qué son los Hitos?](#milestone) | [Inicio](#index) | [Siguiente: Cálculo de Fechas →](#date-calculation)`,

    'date-calculation': `# ¿Cómo se Calculan las Fechas?

La Herramienta calcula automáticamente cuándo puede comenzar y terminar cada actividad de tu proyecto. Esto te ahorra tiempo y evita errores de planificación.

## ¿Por qué es Importante?

### Planificación Automática
Sin cálculo automático tendrías que:
- Calcular manualmente cada fecha
- Recalcular todo si algo cambia
- Verificar que no haya conflictos
- Mantener todo actualizado constantemente

Con La Herramienta, el sistema hace todo esto automáticamente.

## ¿Cómo Funciona?

### Información que Necesita el Sistema
Para calcular las fechas, La Herramienta usa:
- **Fecha de inicio del proyecto**: Cuándo planeas comenzar
- **Duración de cada tarea**: Cuántos días tomará cada actividad
- **Dependencias**: Qué debe terminar antes de que otra cosa comience

### El Proceso de Cálculo

#### 1. Punto de Partida
- Comienza con la fecha de inicio del proyecto
- Identifica las primeras actividades (las que no dependen de nada)

#### 2. Cálculo Secuencial
Para cada actividad:
- **Si no tiene dependencias**: Puede comenzar en la fecha de inicio del proyecto
- **Si tiene dependencias**: Debe esperar a que terminen todas las actividades de las que depende

#### 3. Propagación de Cambios
Si cambias algo (duración, dependencias, fechas), el sistema:
- Recalcula automáticamente todas las fechas afectadas
- Mantiene la coherencia en todo el proyecto
- Te muestra el impacto de los cambios

## Ejemplos Prácticos

### Ejemplo Simple
**Proyecto**: Pintar una habitación
- **Fecha de inicio**: Lunes 1 de enero
- **Tarea A**: "Comprar pintura" (1 día)
- **Tarea B**: "Pintar paredes" (2 días, depende de A)

**Cálculo automático:**
- Tarea A: Lunes 1 - Lunes 1 (1 día)
- Tarea B: Martes 2 - Miércoles 3 (2 días, después de A)
- **Fin del proyecto**: Miércoles 3

### Ejemplo Complejo
**Proyecto**: Construir una casa
- **Fecha de inicio**: Lunes 1 de enero

**Actividades:**
- A: "Excavación" (2 días)
- B: "Cimentación" (3 días, depende de A)
- C: "Paredes" (5 días, depende de B)
- D: "Techo" (3 días, depende de C)
- E: "Instalaciones" (4 días, depende de C)
- F: "Acabados" (2 días, depende de D y E)

**Cálculo automático:**
- A: Lunes 1 - Martes 2
- B: Miércoles 3 - Viernes 5
- C: Lunes 8 - Viernes 12
- D: Lunes 15 - Miércoles 17
- E: Lunes 15 - Jueves 18 (en paralelo con D)
- F: Viernes 19 - Lunes 22 (espera a que terminen D y E)

## Tipos de Fechas

### Fechas Calculadas
- **Qué son**: Las fechas que el sistema calcula automáticamente
- **Cuándo se usan**: Para la planificación inicial
- **Se actualizan**: Automáticamente cuando cambias algo

### Fechas Reales
- **Qué son**: Las fechas que realmente ocurren
- **Cuándo se usan**: Durante la ejecución del proyecto
- **Las estableces tú**: Cuando algo comienza o termina realmente

### Comparación Automática
La Herramienta compara automáticamente:
- **Fecha planificada vs real**: ¿Se cumplió el cronograma?
- **Impacto de retrasos**: ¿Cómo afecta al resto del proyecto?
- **Alertas tempranas**: ¿Qué actividades están en riesgo?

## Casos Especiales

### Actividades en Paralelo
Cuando varias actividades pueden hacerse al mismo tiempo:
- **El sistema las identifica**: No tienen dependencias entre sí
- **Calcula fechas independientes**: Cada una según sus propias dependencias
- **Optimiza el cronograma**: Aprovecha el paralelismo para acortar el proyecto

### Fechas Fijas
Cuando estableces una fecha específica:
- **Fecha límite**: "Debe terminar antes del 31 de diciembre"
- **Fecha de inicio forzada**: "Debe comenzar el 15 de marzo"
- **El sistema se ajusta**: Recalcula todo considerando esa restricción

### Cambios Durante la Ejecución
Cuando algo cambia durante el proyecto:
- **Retrasos**: Si una actividad se atrasa, el sistema recalcula el impacto
- **Adelantos**: Si algo termina antes, puede acelerar otras actividades
- **Nuevas actividades**: Si agregas tareas, se integran al cronograma

## Beneficios del Cálculo Automático

### Ahorro de Tiempo
- No necesitas calcular fechas manualmente
- Los cambios se propagan automáticamente
- Siempre tienes un cronograma actualizado

### Prevención de Errores
- No hay conflictos de fechas
- Las dependencias se respetan siempre
- Los cálculos son consistentes

### Mejor Planificación
- Ves el impacto de los cambios inmediatamente
- Puedes probar diferentes escenarios
- Identificas problemas antes de que ocurran

### Comunicación Clara
- Fechas claras para todo el equipo
- Cronogramas siempre actualizados
- Reportes precisos del progreso

## Consejos Prácticos

### Para Mejores Cálculos
1. **Define dependencias claras**: El sistema necesita saber qué depende de qué
2. **Estima duraciones realistas**: Considera posibles complicaciones
3. **Actualiza fechas reales**: Mantén el sistema informado del progreso real
4. **Revisa regularmente**: Verifica que los cálculos tengan sentido

### Para Aprovechar la Automatización
- **Confía en el sistema**: Los cálculos son precisos si la información es correcta
- **Experimenta con cambios**: Prueba diferentes escenarios para optimizar
- **Usa las alertas**: Presta atención a las advertencias del sistema
- **Mantén actualizado**: Información precisa = cálculos precisos

---

**Navegación:** [← Anterior: ¿Qué son las Tareas?](#task) | [Inicio](#index) | [Siguiente: Camino Crítico →](#critical-path)`,

    'critical-path': `# ¿Qué es el Camino Crítico?

El **Camino Crítico** es la secuencia de actividades más importante de tu proyecto. Son las tareas que, si se retrasan, retrasan todo el proyecto. Es como la cadena más débil: si se rompe un eslabón, se rompe toda la cadena.

## ¿Por qué es Importante?

### Control del Proyecto
El camino crítico te ayuda a:
- **Identificar las actividades más importantes**: Las que no pueden retrasarse
- **Enfocar tu atención**: Dónde poner más recursos y supervisión
- **Predecir la duración del proyecto**: Cuánto tiempo tomará realmente
- **Tomar decisiones informadas**: Qué actividades acelerar si necesitas terminar antes

### Ejemplo Simple
Imagina que estás organizando una fiesta:

**Actividades del proyecto:**
- A: Comprar decoraciones (1 día)
- B: Decorar el lugar (2 días, depende de A)
- C: Comprar comida (1 día)
- D: Cocinar (1 día, depende de C)
- E: Montar mesas (1 día)

**Dos caminos posibles:**
- **Camino 1**: A → B (3 días total)
- **Camino 2**: C → D (2 días total)
- **Camino 3**: E (1 día, independiente)

**El camino crítico es A → B** porque es el más largo (3 días). Si se retrasa la compra o decoración, se retrasa toda la fiesta.

## Características del Camino Crítico

### Sin Margen de Error
Las actividades críticas:
- **No tienen holgura**: No pueden retrasarse sin afectar el proyecto
- **Son secuenciales**: Una depende de la anterior
- **Determinan la duración**: El proyecto no puede terminar antes de que terminen

### Identificación Visual
La Herramienta marca automáticamente las actividades críticas:
- **Color especial**: Se muestran en rojo en el diagrama
- **Alertas**: Te avisa si están en riesgo de retrasarse
- **Prioridad**: Se destacan en los reportes

## ¿Cómo se Identifica?

### Cálculo Automático
La Herramienta identifica automáticamente el camino crítico:
1. **Calcula todas las rutas**: Desde el inicio hasta el fin del proyecto
2. **Encuentra la más larga**: La que toma más tiempo
3. **Marca las actividades**: Las que forman parte de esa ruta
4. **Se actualiza automáticamente**: Cuando cambias algo en el proyecto

### Múltiples Caminos Críticos
A veces hay varios caminos críticos:
- **Mismo tiempo**: Varias rutas que toman la misma duración máxima
- **Mayor riesgo**: Más actividades que pueden retrasar el proyecto
- **Más atención**: Necesitas supervisar múltiples secuencias

## Ejemplos Prácticos

### Proyecto de Construcción
**Camino crítico típico:**
- Excavación → Cimentación → Estructura → Techo → Acabados

**Actividades no críticas:**
- Instalaciones eléctricas (pueden hacerse en paralelo)
- Jardinería (puede retrasarse sin afectar la entrega)

### Proyecto de Software
**Camino crítico típico:**
- Análisis → Diseño → Programación → Pruebas → Despliegue

**Actividades no críticas:**
- Documentación (puede hacerse en paralelo)
- Capacitación (puede hacerse después)

## Gestión del Camino Crítico

### Estrategias de Control

#### Monitoreo Intensivo
- **Seguimiento diario**: Revisa el progreso de actividades críticas
- **Alertas tempranas**: Detecta problemas antes de que se conviertan en retrasos
- **Comunicación frecuente**: Mantén contacto constante con los responsables

#### Asignación de Recursos
- **Mejores recursos**: Asigna tu mejor personal a actividades críticas
- **Recursos adicionales**: Si es necesario, agrega más personas o equipos
- **Prioridad absoluta**: Las actividades críticas tienen prioridad sobre todo lo demás

#### Planes de Contingencia
- **Alternativas preparadas**: Ten planes B para actividades críticas
- **Recursos de reserva**: Mantén recursos disponibles para emergencias
- **Proveedores alternativos**: Ten opciones de respaldo

### Optimización del Camino Crítico

#### Compresión de Actividades
- **Paralelización**: ¿Se pueden hacer algunas actividades al mismo tiempo?
- **Recursos adicionales**: ¿Agregar más personas acelera la actividad?
- **Tecnología**: ¿Hay herramientas que aceleren el trabajo?

#### Replanificación
- **Cambio de secuencia**: ¿Se puede cambiar el orden de algunas actividades?
- **Eliminación**: ¿Hay actividades críticas que realmente no son necesarias?
- **Simplificación**: ¿Se puede reducir el alcance de alguna actividad?

## Impacto de los Retrasos

### En Actividades Críticas
Si una actividad crítica se retrasa:
- **El proyecto completo se retrasa**: En la misma cantidad de días
- **Efecto dominó**: Todas las actividades siguientes se retrasan
- **Costos adicionales**: Pueden generarse penalizaciones o costos extra

### En Actividades No Críticas
Si una actividad no crítica se retrasa:
- **El proyecto no se afecta**: Siempre que no supere su holgura
- **Puede volverse crítica**: Si el retraso es muy grande
- **Reduce flexibilidad**: Menos margen para otros retrasos

## Consejos Prácticos

### Para Gestionar el Camino Crítico
1. **Identifícalo temprano**: Desde la planificación inicial
2. **Comunícalo claramente**: Todo el equipo debe conocerlo
3. **Monitoréalo constantemente**: Revisión diaria o semanal
4. **Actúa rápidamente**: Ante cualquier señal de retraso

### Para Optimizar el Proyecto
- **Reduce la duración crítica**: Enfócate en acelerar estas actividades
- **Crea paralelismo**: Busca actividades que puedan hacerse simultáneamente
- **Balancea recursos**: Mueve recursos de actividades no críticas a críticas
- **Planifica contingencias**: Ten planes alternativos para actividades críticas

### Errores Comunes
- **Ignorar el camino crítico**: Enfocarse en actividades menos importantes
- **No comunicarlo**: El equipo no sabe qué es prioritario
- **No actualizarlo**: El camino crítico puede cambiar durante el proyecto
- **Sobrecargar recursos**: Poner demasiada presión en actividades críticas

## Beneficios de Entender el Camino Crítico

### Mejor Control
- **Enfoque claro**: Sabes exactamente dónde poner atención
- **Decisiones informadas**: Basadas en el impacto real en el proyecto
- **Prevención de problemas**: Identificas riesgos antes de que ocurran

### Comunicación Efectiva
- **Reportes claros**: "El proyecto está en riesgo porque X actividad se retrasó"
- **Expectativas realistas**: Fechas de entrega basadas en la realidad
- **Negociación informada**: Sabes qué se puede cambiar y qué no

### Optimización de Recursos
- **Asignación inteligente**: Recursos donde más impacto tienen
- **Reducción de costos**: Evitas desperdiciar recursos en actividades no críticas
- **Aceleración efectiva**: Sabes exactamente qué acelerar para terminar antes

---

**Navegación:** [← Anterior: Cálculo de Fechas](#date-calculation) | [Inicio](#index)`,
  }

  const loadDocumentation = () => {
    isLoading.value = true
    error.value = null

    try {
      // Cargar contenido embebido
      pages.value = { ...documentationContent }
      isLoading.value = false
    } catch (err) {
      error.value = 'Error al cargar la documentación'
      isLoading.value = false
    }
  }

  return {
    pages,
    isLoading,
    error,
    loadDocumentation
  }
}