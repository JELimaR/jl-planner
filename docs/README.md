# Documentación JL Planner

Esta carpeta contiene la documentación completa del sistema JL Planner.

## Estructura

- `index.md` - Página principal de la wiki
- `project.md` - Documentación sobre Projects
- `item.md` - Documentación sobre Items (clase base)
- `process.md` - Documentación sobre Processes y RootProcess
- `milestone.md` - Documentación sobre Milestones
- `task.md` - Documentación sobre Tasks
- `date-calculation.md` - Cálculo de fechas de inicio
- `critical-path.md` - Camino crítico del proyecto

## Acceso

La documentación está disponible en la página `/info` del sistema, que proporciona una interfaz de navegación tipo wiki para explorar todos los conceptos.

## Contenido

La documentación cubre:

1. **Conceptos fundamentales** - Qué es cada elemento del sistema
2. **Funcionamiento** - Cómo se calculan fechas y dependencias
3. **Camino crítico** - Cómo se identifica y calcula
4. **Ejemplos prácticos** - Casos de uso reales

## Implementación

La documentación se sirve a través de:
- Composable `useDocumentation.ts` que contiene el contenido
- Página Vue `pages/info.vue` que proporciona la interfaz
- Renderizado con `marked` para convertir Markdown a HTML
- Estilos Tailwind CSS para la presentación