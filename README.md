# JL Planner - Aplicación Nuxt.js

Esta aplicación ha sido migrada de Vite + TypeScript a Nuxt.js 3 para mejorar la estructura, el rendimiento y la experiencia de desarrollo.

## 🚀 Características

- **Planificador de Proyectos Gantt**: Crea y gestiona proyectos con diagramas de Gantt interactivos
- **Gestión de Tareas**: Añade, edita y elimina tareas, hitos y procesos
- **Caminos Críticos**: Visualiza automáticamente los caminos críticos del proyecto
- **Exportación**: Exporta proyectos en formato JSON y genera informes PDF
- **Interfaz Moderna**: UI responsiva con Bootstrap 5

## 🛠️ Tecnologías

- **Nuxt.js 3**: Framework Vue.js con SSR/SPA
- **TypeScript**: Tipado estático
- **Bootstrap 5**: Framework CSS
- **HTML2Canvas**: Captura de pantalla para PDF
- **jsPDF**: Generación de documentos PDF

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
jl-planner/
├── assets/
│   └── css/
│       └── style.css          # Estilos personalizados
├── composables/
│   └── useProjectController.ts # Lógica de negocio del proyecto
├── layouts/
│   └── default.vue            # Layout principal
├── pages/
│   └── index.vue              # Página principal
├── plugins/
│   └── bootstrap.client.ts    # Plugin de Bootstrap
├── public/
│   └── project.json           # Proyecto de ejemplo
├── src/
│   ├── controllers/           # Controladores de la aplicación
│   ├── models/                # Modelos de datos
│   └── views/                 # Renderizadores de vistas
├── app.vue                    # Componente raíz
├── nuxt.config.ts            # Configuración de Nuxt
└── package.json              # Dependencias y scripts
```

## 🔧 Configuración

La aplicación está configurada como SPA (Single Page Application) para mantener compatibilidad con el código existente que manipula el DOM directamente.

### Características de la Migración

1. **Composables**: La lógica del controlador del proyecto se ha movido a un composable reutilizable
2. **Layouts**: El HTML principal se ha convertido en un layout de Nuxt
3. **Plugins**: Bootstrap se carga como plugin del lado del cliente
4. **Assets**: Los estilos CSS se han movido a la carpeta assets
5. **TypeScript**: Mantenimiento completo del tipado estático

## 📝 Uso

1. **Crear Proyecto**: Usa el botón "Nuevo proyecto" para empezar desde cero
2. **Cargar Proyecto**: Carga un archivo JSON de proyecto existente
3. **Gestionar Tareas**: Añade tareas, hitos y procesos usando el botón "Agregar Item"
4. **Configurar Dependencias**: Establece relaciones entre tareas
5. **Visualizar Gantt**: Cambia la escala de tiempo (día/semana/mes)
6. **Exportar**: Guarda el proyecto como JSON o genera un informe PDF

## 🎯 Próximas Mejoras

- Migración completa a componentes Vue
- Implementación de estado reactivo con Pinia
- Mejoras en la UI/UX
- Tests unitarios y de integración
- PWA (Progressive Web App)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue antes de realizar cambios importantes.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.