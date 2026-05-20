// ─────────────────────────────────────────────────────────────
//  i18n Configuration — ES / EN Dictionaries
//  Manufacturing & Automotive terminology for the PFMEA
//  Flowchart Workspace module.
// ─────────────────────────────────────────────────────────────

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // ─── App ────────────────────────────────────
      // ─── App ────────────────────────────────────
      app: {
        title: 'PFMEA — VDA & AIAG',
        subtitle: 'Workspace de Proceso',
        breadcrumb: 'Inicio / Proyectos / Diagrama de Flujo',
      },

      // ─── Welcome ────────────────────────────────
      welcome: {
        title: 'Bienvenido a PFMEA Suite',
        subtitle: 'Plataforma Avanzada de Análisis y Prevención de Riesgos',
        flowchart: {
          title: 'Diagramas de Flujo',
          description: 'Crea, edita y gestiona tus diagramas de flujo de proceso con nuestra herramienta interactiva.',
        },
        pfmea: {
          title: 'Análisis PFMEA',
          description: 'Identifica y evalúa los modos de falla potenciales de manera sistemática y profesional.',
        },
        auxiliaries: {
          title: 'Datos Auxiliares',
          description: 'Administra clientes, maquinaria, componentes y operaciones para tus proyectos.',
        },
        getStarted: 'Comenzar ahora',
      },


      // ─── Dashboard ──────────────────────────────
      dashboard: {
        title: 'Inventario de Diagramas de Flujo',
        subtitle: 'Gestión y control de proyectos',
        searchPlaceholder: 'Buscar por Número de Parte o Cliente...',
        filters: {
          allPlants: 'Todas las Plantas',
          allStatuses: 'Todos los Estados',
        },
        table: {
          id: 'ID Doc.',
          customer: 'Cliente',
          plant: 'Planta',
          part: 'Número de Parte',
          description: 'Descripción',
          version: 'Versión',
          status: 'Estado',
          actions: 'Acciones',
          emptyState: 'No hay diagramas que coincidan con la búsqueda.',
        },
        actions: {
          create: 'Nuevo Proyecto',
          edit: 'Editar',
          duplicate: 'Duplicar / Nueva Revisión',
          archive: 'Archivar',
        }
      },

      // ─── Navbar ──────────────────────────────────
      navbar: {
        flowchart: 'Diagrama de Flujo',
        pfmea: 'FMEA',
        auxiliaries: {
          title: 'Auxiliares',
          customers: 'Clientes',
          components: 'Componentes',
          machinery: 'Maquinaria',
          operations: 'Operaciones',
        },
      },

      // ─── Header Panel ──────────────────────────
      header: {
        title: 'Información del Proyecto',
        plantCode: 'Código de Planta',
        plantName: 'Nombre de Planta',
        region: 'Región',
        customer: 'Cliente',
        partNumber: 'Número de Parte',
        partName: 'Nombre de Parte',
        status: 'Estatus',
        lastModified: 'Última Modificación',
        modifiedBy: 'Modificado por',
        collapse: 'Contraer panel',
        expand: 'Expandir panel',
      },

      // ─── Status Values ─────────────────────────
      status: {
        draft: 'Borrador',
        in_review: 'En Revisión',
        approved: 'Aprobado',
      },

      // ─── Table Columns ─────────────────────────
      table: {
        sequence: 'Sec.',
        operation: 'Operación / Tecnología',
        description: 'Descripción del Paso',
        critical: 'Caract. Crítica',
        symbol: 'Símbolo',
        notes: 'Notas',
        actions: 'Acciones',
        dragHandle: 'Arrastrar para reordenar',
        emptyState: 'No hay pasos definidos. Agrega el primer paso del proceso.',
        addStep: 'Agregar Paso',
        stepCount: '{{count}} paso(s) definido(s)',
      },

      // ─── Symbol Types ──────────────────────────
      symbols: {
        operation: 'Operación',
        inspection: 'Inspección',
        transport: 'Transporte',
        storage: 'Almacenamiento',
        delay: 'Demora',
      },

      // ─── Critical Flags ────────────────────────
      flags: {
        none: 'Ninguna',
        CC: 'Característica Crítica',
        SC: 'Característica de Seguridad',
        tooltip: 'Clic para cambiar clasificación',
      },

      // ─── Actions ───────────────────────────────
      actions: {
        save: 'Guardar Localmente',
        publish: 'Publicar Versión',
        duplicate: 'Duplicar Paso',
        delete: 'Eliminar Paso',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        saving: 'Guardando...',
        saved: 'Cambios guardados',
        synced: 'Sincronizado',
        pending: 'Cambios pendientes',
        undo: 'Deshacer',
      },

      // ─── Delete Confirmation ───────────────────
      deleteModal: {
        title: '¿Eliminar este paso?',
        message: 'Se eliminará el paso "{{name}}" (Secuencia {{sequence}}). Esta acción no se puede deshacer.',
        confirm: 'Sí, eliminar',
        cancel: 'Cancelar',
      },

      // ─── Operation Categories ──────────────────
      operations: {
        searchPlaceholder: 'Buscar operación...',
        noResults: 'Sin resultados',
        categories: {
          assembly: 'Ensamblaje',
          forming: 'Conformado',
          inspection: 'Inspección y Prueba',
          finishing: 'Acabado',
          material: 'Manejo de Material',
          chemical: 'Procesos Químicos',
        },
      },

      // ─── Language ──────────────────────────────
      lang: {
        toggle: 'Idioma',
        es: 'Español',
        en: 'English',
      },

      // ─── Theme ──────────────────────────────────
      theme: {
        toggle: 'Alternar Tema Claro/Oscuro',
      },
    },
  },

  en: {
    translation: {
      // ─── App ────────────────────────────────────
      // ─── App ────────────────────────────────────
      app: {
        title: 'PFMEA — Flowchart',
        subtitle: 'Process Workspace',
        breadcrumb: 'Home / Projects / Flowchart',
      },

      // ─── Welcome ────────────────────────────────
      welcome: {
        title: 'Welcome to PFMEA Suite',
        subtitle: 'Advanced Risk Analysis and Prevention Platform',
        flowchart: {
          title: 'Flowcharts',
          description: 'Create, edit, and manage your process flowcharts with our interactive tool.',
        },
        pfmea: {
          title: 'PFMEA Analysis',
          description: 'Identify and evaluate potential failure modes systematically and professionally.',
        },
        auxiliaries: {
          title: 'Auxiliary Data',
          description: 'Manage customers, machinery, components, and operations for your projects.',
        },
        getStarted: 'Get Started',
      },

      // ─── Dashboard ──────────────────────────────
      dashboard: {
        title: 'Flowchart Inventory',
        subtitle: 'Project management and control',
        searchPlaceholder: 'Search by Part Number or Customer...',
        filters: {
          allPlants: 'All Plants',
          allStatuses: 'All Statuses',
        },
        table: {
          id: 'Doc ID',
          customer: 'Customer',
          plant: 'Plant',
          part: 'Part Number',
          description: 'Description',
          version: 'Version',
          status: 'Status',
          actions: 'Actions',
          emptyState: 'No flowcharts match the search criteria.',
        },
        actions: {
          create: 'New Project',
          edit: 'Edit',
          duplicate: 'Duplicate / New Rev',
          archive: 'Archive',
        }
      },

      // ─── Navbar ──────────────────────────────────
      navbar: {
        flowchart: 'Flowchart',
        pfmea: 'PFMEA',
        auxiliaries: {
          title: 'Auxiliaries',
          customers: 'Customers',
          components: 'Components',
          machinery: 'Machinery',
          operations: 'Operations',
        },
      },

      // ─── Header Panel ──────────────────────────
      header: {
        title: 'Project Information',
        plantCode: 'Plant Code',
        plantName: 'Plant Name',
        region: 'Region',
        customer: 'Customer',
        partNumber: 'Part Number',
        partName: 'Part Name',
        status: 'Status',
        lastModified: 'Last Modified',
        modifiedBy: 'Modified By',
        collapse: 'Collapse panel',
        expand: 'Expand panel',
      },

      // ─── Status Values ─────────────────────────
      status: {
        draft: 'Draft',
        in_review: 'In Review',
        approved: 'Approved',
      },

      // ─── Table Columns ─────────────────────────
      table: {
        sequence: 'Seq.',
        operation: 'Operation / Technology',
        description: 'Step Description',
        critical: 'Critical Char.',
        symbol: 'Symbol',
        notes: 'Notes',
        actions: 'Actions',
        dragHandle: 'Drag to reorder',
        emptyState: 'No steps defined. Add the first process step.',
        addStep: 'Add Step',
        stepCount: '{{count}} step(s) defined',
      },

      // ─── Symbol Types ──────────────────────────
      symbols: {
        operation: 'Operation',
        inspection: 'Inspection',
        transport: 'Transport',
        storage: 'Storage',
        delay: 'Delay',
      },

      // ─── Critical Flags ────────────────────────
      flags: {
        none: 'None',
        CC: 'Critical Characteristic',
        SC: 'Safety Characteristic',
        tooltip: 'Click to change classification',
      },

      // ─── Actions ───────────────────────────────
      actions: {
        save: 'Save Locally',
        publish: 'Publish Version',
        duplicate: 'Duplicate Step',
        delete: 'Delete Step',
        cancel: 'Cancel',
        confirm: 'Confirm',
        saving: 'Saving...',
        saved: 'Changes saved',
        synced: 'Synced',
        pending: 'Pending changes',
        undo: 'Undo',
      },

      // ─── Delete Confirmation ───────────────────
      deleteModal: {
        title: 'Delete this step?',
        message: 'Step "{{name}}" (Sequence {{sequence}}) will be deleted. This action cannot be undone.',
        confirm: 'Yes, delete',
        cancel: 'Cancel',
      },

      // ─── Operation Categories ──────────────────
      operations: {
        searchPlaceholder: 'Search operation...',
        noResults: 'No results',
        categories: {
          assembly: 'Assembly',
          forming: 'Forming',
          inspection: 'Inspection & Testing',
          finishing: 'Finishing',
          material: 'Material Handling',
          chemical: 'Chemical Processes',
        },
      },

      // ─── Language ──────────────────────────────
      lang: {
        toggle: 'Language',
        es: 'Español',
        en: 'English',
      },

      // ─── Theme ──────────────────────────────────
      theme: {
        toggle: 'Toggle Light/Dark Theme',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',            // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,  // React already escapes
  },
});

export default i18n;
