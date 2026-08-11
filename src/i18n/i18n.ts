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
      // ─── Common ─────────────────────────────────
      common: {
        addRow: 'Añadir Fila',
        saving: 'Guardando...',
        saveChanges: 'Guardar Cambios',
        save: 'Guardar',
        saved: 'Guardado',
        select: 'Seleccionar...',
        cancel: 'Cancelar',
        localDraft: 'Borrador Local',
        localDraftDesc: 'Los cambios se guardan en tu navegador hasta que los envíes al servidor.',
        localDraftDescShort: 'Guardado en navegador',
        customer: 'Cliente',
        status: 'Estado',
        search: 'Buscar...',
        created: 'Creado:',
        modified: 'Modificado:',
        allPlants: 'Todas las plantas',
        allLocations: 'Todas las ubicaciones',
      },
      sort: {
        newest: 'Más recientes',
        oldest: 'Más antiguos',
        aToZ: 'Nombre (A-Z)',
        zToA: 'Nombre (Z-A)',
      },

      // ─── Login ──────────────────────────────────
      login: {
        languageSwitcher: {
          es: 'ES',
          en: 'EN',
        },
        forgotPasswordLink: '¿Olvidaste tu contraseña?',
        forgotPasswordTitle: 'Recuperar Contraseña',
        forgotPasswordDesc: 'Ingresa tu correo para recibir un código de restablecimiento de 6 dígitos.',
        resetPasswordTitle: 'Restablecer Contraseña',
        resetPasswordDesc: 'Ingresa el código OTP y tu nueva contraseña.',
        subtitle: 'APG DMS (Sistema de Gestión de Documentos)',
        emailLabel: 'Correo Electrónico de Planta',
        passwordLabel: 'Contraseña',
        newPasswordLabel: 'Nueva Contraseña',
        otpLabel: 'Código de Seguridad OTP',
        continueButton: 'Continuar',
        sendOtp: 'Enviar Código',
        verifyAndReset: 'Cambiar Contraseña',
        verifyAndAccess: 'Verificar & Acceder',
        backToLogin: 'Atrás',
        otpSent: 'Código enviado',
        otpSentDesc: 'Revisa tu correo. Te hemos enviado un código de seguridad OTP.',
        otpSentText: 'Hemos enviado un código temporal de 6 dígitos a ',
        resendOtpTimer: 'Reenviar en {{seconds}}s',
        resendOtp: 'Reenviar Código',
        incompleteFields: 'Campos incompletos',
        incompleteFieldsDesc: 'Por favor, llena todos los campos.',
        invalidOtp: 'Código inválido',
        invalidOtpDesc: 'El código OTP debe ser de exactamente 6 dígitos.',
        shortPassword: 'Contraseña muy corta',
        shortPasswordDesc: 'La contraseña debe tener al menos 8 caracteres.'
      },

      // ─── App ────────────────────────────────────
      app: {
        title: 'APG DMS - Document Management System',
        subtitle: 'Workspace de Proceso',
        breadcrumb: 'Inicio / Proyectos / Diagrama de Flujo',
        documentTitle: 'APG DMS — Document Management System',
        documentDescription: 'APG DMS — Document Management System para el control del ciclo de vida del producto.',
      },

      // ─── Welcome ────────────────────────────────
      welcome: {
        title: 'APG Document Management System',
        subtitle: 'Plataforma para la Gestión de Calidad (DMS)',
        vision: 'Centraliza y organiza el ciclo de vida del producto alineado a los requerimientos de la metodología VDA & AIAG. Unifica diagramas de flujo, PFMEA y planes de control en un solo ecosistema.',
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

      // ─── Admin ────────────────────────────────
      admin: {
        users: {
          title: 'Gestión de Usuarios',
          subtitle: 'Administración de accesos, roles de trabajo y auditoría de personal de la planta APG Puebla.',
          refresh: 'Actualizar',
          addUser: 'Añadir Usuario',
          loading: 'Cargando directorio de personal...',
          table: {
            staff: 'Personal',
            email: 'Correo',
            role: 'Rol Técnico',
            department: 'Departamento',
            tisax: 'Estado TISAX',
            actions: 'Acciones'
          },
          noUsers: 'No se encontraron usuarios registrados.',
          status: {
            active: 'Activo',
            inactive: 'Inactivo',
            archived: 'Archivado'
          },
          actions: {
            inactivate: 'Inactivar',
            reactivate: 'Reactivar',
            edit: 'Editar'
          },
          errors: {
            restrictedAccess: 'Acceso Restringido',
            restrictedDesc: 'Esta sección está reservada exclusivamente para los Administradores de planta de Adler Pelzer Group. Si consideras que esto es un error, por favor ponte en contacto con soporte técnico.',
            loadFailed: 'Error al cargar datos',
            loadFailedDesc: 'No se pudieron cargar los usuarios. Verifica tus permisos.',
            updateRole: 'Error al actualizar rol',
            updateStatus: 'Error de actualización',
            selfDeactivate: 'No puedes desactivar tu propia cuenta de administrador.',
            emailExists: 'El correo ya está registrado en el sistema.',
            resendVerification: 'Error al reenviar el enlace'
          },
          success: {
            roleUpdated: 'Rol actualizado',
            roleUpdatedDesc: 'Se ha reasignado el rol técnico a {{role}} correctamente.',
            statusUpdated: 'Usuario {{status}}',
            statusUpdatedDesc: 'El usuario se ha {{action}} con éxito.',
            userCreated: 'Usuario Creado',
            userCreatedDesc: 'El nuevo usuario se ha registrado correctamente.',
            userUpdated: 'Usuario Actualizado',
            userUpdatedDesc: 'Los datos del usuario han sido actualizados con éxito.',
            verificationResent: 'Enlace reenviado',
            verificationResentDesc: 'Se ha enviado un nuevo enlace de verificación (válido por 24h).'
          },
          modal: {
            createTitle: 'Registrar Nuevo Usuario',
            editTitle: 'Editar Usuario',
            createSubtitle: 'Crea un nuevo perfil de acceso al sistema',
            editSubtitle: 'Modifica los datos del usuario seleccionado',
            fullName: 'Nombre Completo',
            email: 'Correo Electrónico',
            password: 'Contraseña Provisional',
            department: 'Departamento',
            position: 'Puesto',
            role: 'Rol en Sistema',
            save: 'Guardar Usuario',
            cancel: 'Cancelar'
          }
        }
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
          createdAt: 'Creado',
          updatedAt: 'Modificado',
          actions: 'Acciones',
          emptyState: 'No hay diagramas que coincidan con la búsqueda.',
        },
        actions: {
          create: 'Nuevo Proyecto',
          edit: 'Editar',
          duplicate: 'Duplicar / Nueva Revisión',
          archive: 'Archivar',
        },
        modal: {
          title: 'Nuevo Proyecto de Diagrama',
          subtitle: 'Introduce los metadatos para iniciar el flujo',
          projectName: 'Nombre del Proyecto',
          projectNamePlaceholder: 'Ej. Alfombras Audi LHD AU436',
          productInfo: 'Información del Producto',
          selectExisting: 'Seleccionar Existente',
          createNew: 'Crear Nuevo Producto',
          advancedProductManagement: 'Ir a gestión avanzada de productos',
          selectProduct: 'Selecciona un Producto',
          loadingProducts: 'Cargando productos...',
          noProducts: 'No hay productos en base de datos. Crea uno nuevo.',
          newProductTitle: 'Nuevo Producto Terminado (PT)',
          errorNoProjectName: 'El nombre del proyecto es obligatorio.',
          errorNoCustomerPart: 'El cliente y el número de parte son obligatorios para crear un producto.',
          successProductCreated: 'Producto {{partNumber}} creado con éxito.',
          errorNoProductSelected: 'Debes seleccionar un producto.',
          successProjectCreated: 'Proyecto de diagrama de flujo creado correctamente.',
          errorCreation: 'Error al crear el proyecto. Revisa los datos.',
          createProjectBtn: 'Crear Proyecto'
        }
      },

      // ─── Archive Module ──────────────────────────
      archive: {
        modal: {
          title: 'Archivar Documento',
          subtitle: 'Este documento pasará al repositorio histórico',
          reasonLabel: 'Motivo del Cambio / Razón de Obsolescencia',
          reasonPlaceholder: 'Describe el motivo (mín. 10 caracteres)...',
          ecoLabel: 'N° ECO (Orden de Cambio de Ingeniería)',
          ecoPlaceholder: 'Ej. ECO-2024-001',
          ecoOptional: 'Opcional',
          confirmCheck: 'Confirmo que este documento pasará al repositorio histórico y no estará disponible para edición en terminales de planta.',
          archiveBtn: 'Archivar Documento',
          cancelBtn: 'Cancelar',
          metadataTitle: 'Información del Documento',
          docId: 'ID Documento',
          docTitle: 'Título',
          docVersion: 'Versión Actual',
          docStatus: 'Estado Actual',
          docCreated: 'Fecha de Creación',
          warningTitle: 'Acción Irreversible',
          warningDesc: 'El documento se moverá al repositorio histórico. El equipo multidisciplinario será notificado por correo.',
        },
        banner: {
          title: 'DOCUMENTO OBSOLETO',
          subtitle: 'Solo lectura — Repositorio Histórico',
          archivedBy: 'Archivado por',
          archivedOn: 'el',
          viewHistory: 'Ver Historial Completo',
          readOnly: 'Este documento no puede ser editado.',
        },
        watermark: {
          text: 'OBSOLETO',
        },
        history: {
          title: 'Historial del Documento',
          subtitle: 'Línea de tiempo de versiones y auditoría',
          timeline: 'Línea de Tiempo',
          metadata: 'Metadatos de Archivo',
          retention: 'Política de Retención',
          noHistory: 'Aún no hay registros de historial para este documento.',
          events: {
            created: 'Documento Creado',
            approved: 'Documento Aprobado',
            archived: 'Documento Archivado',
            revised: 'Nueva Revisión',
            inReview: 'Enviado a Revisión',
          },
          by: 'por',
          on: 'el',
          reason: 'Motivo',
          eco: 'ECO',
          version: 'Versión',
          snapshotSteps: 'Pasos registrados',
          metadataFields: {
            docId: 'ID Documento',
            revision: 'N° de Revisión',
            validFrom: 'Fecha de Vigencia Inicial',
            archivedOn: 'Fecha de Obsolescencia',
            approver: 'Aprobador',
            ecoRef: 'Referencia ECO',
            documentType: 'Tipo de Documento',
          },
          retentionFields: {
            title: 'Período de Retención Obligatorio',
            policy: 'FC/AMEF/PC: vigencia en producción + 1 año adicional (IATF 16949). OT: año en curso + 3 años fiscales.',
            minimumUntil: 'Retención mínima hasta',
            policyType: 'Política aplicable',
            productionDoc: 'Documento Proceso/Producto',
            workInstruction: 'Instrucción de Trabajo',
            csr: 'CSR puede extender hasta 15–30 años',
          },
        },
        filter: {
          showArchived: 'Mostrar archivados',
          hideArchived: 'Ocultar archivados',
        },
        status: {
          archived: 'Archivado',
          obsolete: 'Obsoleto',
        },
        errors: {
          archiveFailed: 'Error al archivar el documento. Intenta nuevamente.',
          historyLoadFailed: 'No se pudo cargar el historial del documento.',
          alreadyArchived: 'Este documento ya está archivado.',
          reasonRequired: 'El motivo es obligatorio (mín. 10 caracteres).',
          confirmRequired: 'Debes confirmar la acción marcando la casilla.',
        },
        success: {
          archived: 'Documento archivado. El equipo ha sido notificado por correo.',
        },
      },

      // ─── Navbar ──────────────────────────────────
      navbar: {
        flowchart: 'Diagrama de Flujo',
        pfmea: 'PFMEA',
        products: 'Productos',
        users: 'Usuarios',
        auxiliaries: {
          title: 'Auxiliares',
          customers: 'Clientes',
          components: 'Componentes',
          machinery: 'Maquinaria y Herramentales',
          operations: 'Operaciones',
          technologies: 'Tecnologías',
          locations: 'Ubicaciones',
          measurementUnits: 'Unidades de Medida',
        },
      },
      pfmea: {
        dashboard: {
          title: 'Inventario PFMEA',
          subtitle: 'Gestión y control de análisis de modo y efecto de falla',
          newButton: 'Nuevo PFMEA',
          searchPlaceholder: 'Buscar por nombre, ID o cliente...',
          filters: {
            allStates: 'Todos los estados',
            draft: 'Borrador',
            approved: 'Aprobado',
            archived: 'Archivado'
          },
          table: {
            id: 'ID Documento',
            project: 'Proyecto',
            partNumber: 'Número de Parte',
            customer: 'Cliente',
            status: 'Estado',
            version: 'Versión',
            createdAt: 'Creado',
            updatedAt: 'Modificado',
            actions: 'Acciones',
            noProjects: 'No se encontraron proyectos PFMEA.',
            noNumber: 'Sin Número'
          },
          actions: {
            edit: 'Editar',
            duplicate: 'Duplicar',
            archive: 'Archivar'
          },
          errors: {
            loadFailed: 'No se pudieron cargar los PFMEA. Verifica tu conexión.',
            loadFlowchartsFailed: 'No se pudieron cargar los diagramas de flujo.',
            projectNameRequired: 'El nombre del proyecto es obligatorio.',
            flowchartRequired: 'Debes seleccionar un Diagrama de Flujo base.',
            createFailed: 'Error al crear el proyecto. Revisa los datos.'
          },
          success: {
            created: 'Proyecto PFMEA creado correctamente.'
          },
          noCustomer: 'Sin Cliente Especificado',
          retry: 'Reintentar',
          modal: {
            title: 'Nuevo PFMEA',
            subtitle: 'Vincular a un Diagrama de Flujo y Producto',
            projectName: 'Nombre del Proyecto',
            projectPlaceholder: 'Ej. PFMEA Alfombras Audi',
            flowchartBase: 'Diagrama de Flujo Base',
            loadingFlowcharts: 'Cargando diagramas...',
            noFlowcharts: 'No hay diagramas de flujo disponibles.',
            cancel: 'Cancelar',
            createProject: 'Crear Proyecto'
          }
        },
        team: {
          addMember: 'Agregar Miembro al Equipo',
          addMemberDesc: 'Asigna usuarios al equipo multidisciplinario',
          selectUser: 'Seleccionar Usuario',
          role: 'Rol en el Equipo',
          department: 'Departamento',
          addSuccess: 'Miembro agregado exitosamente',
          userAlreadyInTeam: 'El usuario {{userName}} ya pertenece al equipo en el departamento de {{department}}.',
          addError: 'Error al agregar miembro al equipo.',
          loadingUsers: 'Cargando usuarios...',
          deptFromProfile: 'El departamento se asigna desde el perfil del usuario',
          roleFromProfile: 'El rol se asigna desde el perfil del usuario'
        },
        header: {
          title: 'Información del Proyecto PFMEA',
          coreTeam: 'Equipo Principal (Core Team)',
          addMember: 'Agregar Miembro',
          syncFlowchart: 'Sincronizar Flowchart',
          mocStatus: 'Estado MOC',
          projectMetadata: 'Metadatos',
          unsavedChanges: 'Cambios sin guardar',
          description: 'Descripción / Nombre del Proyecto',
          partNumber: 'Número de Parte',
          customer: 'Cliente',
          plantRegion: 'Planta / Región (Catálogo)',
          creationDate: 'Fecha de Creación',
          revisionDate: 'Fecha de Revisión',
          revision: 'Revisión',
          status: 'Estado',
          docCode: 'Código de Portada / DOC',
          companyLogo: 'Logo Empresa',
          clickToUpdateLogo: 'Haga clic para actualizar logo',
          manageAux: 'Gestionar Valores Auxiliares',
          hideAux: 'Ocultar Valores Auxiliares',
          productFamily: 'Familia de Producto',
          editCatalog: 'Editar Catálogo',
          productionLine: 'Línea de Producción',
          confidentiality: 'Confidencialidad',
          public: 'Público',
          internal: 'Interno',
          confidential: 'Confidencial',
          strictlyConfidential: 'Estrictamente Confidencial',
          processSymbolConfig: 'Simbología de Diagrama de Proceso'
        },
        editor: {
          invalidId: 'ID Inválido',
          backToInventory: 'Volver al Inventario',
          loadingProject: 'Cargando proyecto PFMEA...',
          docNotFound: 'Documento no encontrado',
          docNotFoundDesc: 'El proyecto PFMEA solicitado no existe o no tienes acceso.',
          docId: 'ID Documento',
          inEdition: 'En Edición',
          tabs: {
            worksheet: 'Hoja de Trabajo',
            myTasks: 'Mis Tareas',
            moc: 'MOC (Control de Cambios)'
          },
          loadingTasks: 'Cargando tareas...',
          loadingHistory: 'Cargando historial...',
          success: {
            headerUpdated: 'Cabecera actualizada correctamente',
            worksheetSaved: 'Hojas de trabajo guardadas correctamente'
          },
          error: {
            headerUpdate: 'Error al actualizar la cabecera',
            worksheetSave: 'Error al guardar las hojas de trabajo'
          }
        },
        worksheet: {
          title: 'Hoja de Trabajo PFMEA',
          structure: 'Análisis de Estructura',
          function: 'Análisis de Función',
          failure: 'Análisis de Falla',
          risk: 'Análisis de Riesgo',
          optimization: 'Optimización',
          steps: {
            step1: 'Paso 1: Planificación y preparación',
            step2: 'Paso 2: Análisis de Estructura',
            step3: 'Paso 3: Análisis de Función',
            step4: 'Paso 4: Análisis de Falla',
            step5: 'Paso 5: Análisis de Riesgo',
            step6: 'Paso 6: Optimización',
            step1Desc: 'Definición del proyecto, equipo central y alcance.',
            step2Desc: 'Identificación de elementos de proceso.',
            step3Desc: 'Funciones y características.',
            step4Desc: 'Efectos, modos y causas.',
            step5Desc: 'Controles preventivos y detección.',
            step6Desc: 'Acciones de mejora y responsables.',
          },
          columns: {
            processItem: '1. Elemento del Proceso',
            station: '2. Paso del Proceso / Estación',
            workElement: '3. Elemento de Trabajo',
            functionItemPlant: '1. Función del elemento',
            functionStepProduct: '2.a Función del paso',
            productCharacteristic: '2.b Caract. de producto',
            functionWorkElementChar: '3.a Función del trabajo',
            processCharacteristic: '3.b Caract. de proceso',
            functionStep: 'Función/Requisito',
            failureMode: 'Modo de Falla',
            failureEffect: 'Efecto',
            failureEffectCol: '1. Efectos (FE)',
            failureModeCol: '2. Modos (FM)',
            failureCauseCol: '3. Causas (FC)',
            severity: 'S',
            failureCause: 'Causa',
            occurrence: 'O',
            prevention: 'Control Prev. (PC)',
            detectionCtrl: 'Control Det. (DC)',
            detection: 'D',
            ap: 'PFMEA AP',
            specialCharacteristics: 'Caract. Especiales',
            optPrevention: 'Acción Preventiva',
            optDetection: 'Acción Detectiva',
            optResponsible: 'Responsable',
            optTargetDate: 'Fecha Límite',
            optStatus: 'Estatus',
            optActionsTaken: 'Acciones (Evidencia)',
            optCompletionDate: 'Fecha Fin',
            optSeverity: 'S',
            optOccurrence: 'O',
            optDetectionVal: 'D',
            optSpecialCharacteristics: 'Caract. Especiales',
            optAP: 'PFMEA AP',
            optObservations: 'Observaciones',
            responsible: 'Responsable',
            targetDate: 'Fecha Obj.',
            status: 'Estado',
          },
          abbr: {
            processItem: 'P. Item',
            station: 'Estación',
            workElement: '4M',
            functionItemPlant: 'Fn. Item',
            functionStepProduct: '2.a Fn. Paso',
            productCharacteristic: '2.b Carac. Prod.',
            functionWorkElementChar: '3.a Fn. Trab.',
            processCharacteristic: '3.b Carac. Proc.',
            failureEffectCol: 'Ef. Falla',
            severity: 'S',
            failureModeCol: 'Modo F.',
            failureCauseCol: 'Causa F.',
            prevention: 'Prev.',
            occurrence: 'O',
            detectionCtrl: 'Detec.',
            detection: 'D',
            ap: 'AP',
            specialCharacteristics: 'C. Esp.',
            optPrevention: 'Acc. Prev.',
            optDetection: 'Acc. Detec.',
            optResponsible: 'Resp.',
            optTargetDate: 'Fecha',
            optStatus: 'Est.',
            optActionsTaken: 'Evid.',
            optCompletionDate: 'Fin',
            optSeverity: 'S',
            optOccurrence: 'O',
            optDetectionVal: 'D',
            optSpecialCharacteristics: 'C.E.',
            optAP: 'AP',
            optObservations: 'Obs.',
          },
          labels: {
            plantInternal: 'Planta (Interno)',
            customerPlant: 'Planta de cliente (Externo)',
            endUser: 'Usuario final',
          },
          options: {
            '4m': {
              machine: 'Máquina',
              manpower: 'Mano de obra',
              material: 'Material',
              environment: 'Medio ambiente',
              method: 'Método',
              measurement: 'Medición',
            }
          },
          emptySync: 'No hay pasos de análisis. Sincroniza con el diagrama de flujo para comenzar.',
          emptySyncTitle: 'Aún no hay pasos de análisis',
          emptySyncDesc: 'El documento está vacío. Sincroniza con el diagrama de flujo para comenzar el análisis o agrega una nueva fila manualmente.',
          validationError: 'Por favor completa todos los campos requeridos (Pasos 2 al 5).',
          status: {
            open: 'Abierto',
            inProgress: 'En Progreso',
            completed: 'Completado'
          },
          severityCriteria: {
            title: 'Criterios de Evaluación General del Proceso - Severidad (S)',
            headers: {
              s: '"S"',
              effect: 'Efecto',
              impactPlant: 'Impacto en su planta',
              impactShip: 'Impacto en la planta de envío (si se conoce)',
              impactEndUser: 'Impacto en el Usuario Final (si se conoce)',
            },
            levels: {
              high: 'Alto',
              modHigh: 'Moderadamente Alto',
              modLow: 'Moderadamente Bajo',
              low: 'Bajo',
              veryLow: 'Muy Bajo',
            },
            descriptions: {
              10: {
                plant: 'La falla puede resultar en un riesgo agudo para la salud y/o seguridad del trabajador de manufactura o ensamble.',
                ship: 'La falla puede resultar en un riesgo agudo para la salud y/o seguridad del trabajador de manufactura o ensamble.',
                endUser: 'Afecta la operación segura del vehículo y/u otros vehículos, la salud del conductor o pasajero(s), usuarios de la vía o peatones.'
              },
              9: {
                plant: 'La falla puede resultar en incumplimiento normativo dentro de la planta.',
                ship: 'La falla puede resultar en incumplimiento normativo dentro de la planta.',
                endUser: 'Incumplimiento de normativas.'
              },
              8: {
                plant: 'Puede que se deba desechar el 100% de la producción afectada. La falla puede resultar en incumplimiento normativo o un riesgo crónico de salud/seguridad para el trabajador.',
                ship: 'Paro de línea mayor a un turno normal; posible detención de envío; requiere reparación de campo o reemplazo (Ensamble a Usuario Final) distinto al normativo. Riesgo de salud/seguridad crónico.',
                endUser: 'Pérdida de la función principal del vehículo, necesaria para la conducción normal durante su vida útil.'
              },
              7: {
                plant: 'Puede requerir selección de la producción y desecho parcial. Desviación del proceso principal. Disminución de velocidad de línea o necesidad de personal adicional.',
                ship: 'Paro de línea desde una hora hasta un turno completo; posible detención de envío; requiere reparación o reemplazo de campo distinto al normativo.',
                endUser: 'Degradación de la función principal del vehículo, necesaria para la conducción normal.'
              },
              6: {
                plant: '100% de la producción puede requerir retrabajo fuera de línea para ser aceptada.',
                ship: 'Paro de línea de hasta una hora.',
                endUser: 'Pérdida de una función secundaria del vehículo.'
              },
              5: {
                plant: 'Una parte de la producción puede requerir retrabajo para ser aceptada.',
                ship: 'Menos del 100% afectado; fuerte posibilidad de más producto defectuoso; requiere selección; sin paro de línea.',
                endUser: 'Degradación de una función secundaria del vehículo.'
              },
              4: {
                plant: '100% de la producción puede requerir retrabajo en la misma estación antes del procesamiento.',
                ship: 'El producto defectuoso activa un plan de reacción significativo; poco probables más productos defectuosos; no requiere selección.',
                endUser: 'Apariencia, sonido, vibración, aspereza o sensación háptica muy objetable.'
              },
              3: {
                plant: 'Una parte de la producción puede requerir retrabajo en la misma estación antes de ser procesada.',
                ship: 'El producto defectuoso activa un plan de reacción menor; poco probables más productos defectuosos; no requiere selección.',
                endUser: 'Apariencia, sonido, vibración, aspereza o sensación háptica moderadamente objetable.'
              },
              2: {
                plant: 'Ligera molestia o inconveniente.',
                ship: 'El producto defectuoso no activa plan de reacción; requiere retroalimentación al proveedor; no requiere selección.',
                endUser: 'Apariencia, sonido, vibración, aspereza o sensación háptica ligeramente objetable.'
              },
              1: {
                plant: 'Sin efecto perceptible.',
                ship: 'Sin efecto perceptible o ningún efecto.',
                endUser: 'Sin efecto perceptible.'
              }
            }
          },
          occurrenceCriteria: {
            title: 'Potencial de Ocurrencia (O) para el Proceso',
            headers: {
              o: '"O"',
              prediction: 'Predicción de ocurrencia de la causa de falla',
              typeOfControl: 'Tipo de Control',
              preventionControls: 'Controles de Prevención'
            },
            levels: {
              extremelyHigh: 'Extremadamente Alto',
              veryHigh: 'Muy Alto',
              high: 'Alto',
              moderate: 'Moderado',
              low: 'Bajo',
              veryLow: 'Muy Bajo',
              extremelyLow: 'Extremadamente Bajo'
            },
            descriptions: {
              10: {
                type: 'Ninguno',
                prevention: 'Sin controles de prevención.'
              },
              9: {
                type: 'Comportamiento',
                prevention: 'Los controles de prevención tendrán poco efecto para prevenir la causa de la falla.'
              },
              8: {
                type: 'Comportamiento',
                prevention: 'Los controles de prevención tendrán poco efecto para prevenir la causa de la falla.'
              },
              7: {
                type: '',
                prevention: 'Controles de prevención algo efectivos para prevenir la causa de la falla.'
              },
              6: {
                type: '',
                prevention: 'Controles de prevención algo efectivos para prevenir la causa de la falla.'
              },
              5: {
                type: 'Comportamiento o Técnico',
                prevention: 'Los controles de prevención son efectivos para prevenir la causa de la falla.'
              },
              4: {
                type: 'Comportamiento o Técnico',
                prevention: 'Los controles de prevención son efectivos para prevenir la causa de la falla.'
              },
              3: {
                type: 'Mejores Prácticas: Comportamiento o Técnico',
                prevention: 'Los controles de prevención son altamente efectivos para prevenir la causa de la falla.'
              },
              2: {
                type: 'Mejores Prácticas: Comportamiento o Técnico',
                prevention: 'Los controles de prevención son altamente efectivos para prevenir la causa de la falla.'
              },
              1: {
                type: 'Técnico',
                prevention: 'Los controles de prevención son extremadamente efectivos para prevenir la causa de la falla debido al diseño o proceso. Intención de los controles de prevención - El Modo de Falla no puede ser físicamente producido debido a la Causa de la Falla.'
              }
            }
          },
          detectionCriteria: {
            title: 'Potencial de Detección (D) para la Validación del Diseño del Proceso',
            headers: {
              d: '"D"',
              ability: 'Habilidad para Detectar',
              maturity: 'Madurez del Método de Detección',
              opportunity: 'Oportunidad de Detección'
            },
            levels: {
              veryLow: 'Muy Baja',
              low: 'Baja',
              moderate: 'Moderada',
              high: 'Alta',
              veryHigh: 'Muy Alta'
            },
            descriptions: {
              10: {
                maturity: 'No se ha establecido o no se conoce ningún método de prueba o inspección.',
                opportunity: 'El modo de falla no será o no puede ser detectado.'
              },
              9: {
                maturity: 'Es poco probable que el método de prueba o inspección detecte el modo de falla.',
                opportunity: 'El modo de falla no es detectado fácilmente a través de auditorías aleatorias o esporádicas.'
              },
              8: {
                maturity: 'El método de prueba o inspección no ha demostrado ser efectivo y confiable.',
                opportunity: 'Inspección humana (visual, táctil, auditiva), o uso de medición manual que debería detectar el modo o la causa de la falla.'
              },
              7: {
                maturity: 'El método de prueba o inspección no ha demostrado ser efectivo y confiable.',
                opportunity: 'Detección basada en máquina (automatizada o semi-automatizada) o equipo de inspección que debería detectar el modo o la causa de la falla.'
              },
              6: {
                maturity: 'El método de prueba o inspección ha demostrado ser efectivo y confiable.',
                opportunity: 'Inspección humana (visual, táctil, auditiva), o uso de medición manual que detectará el modo o la causa de la falla.'
              },
              5: {
                maturity: 'El método de prueba o inspección ha demostrado ser efectivo y confiable.',
                opportunity: 'Detección basada en máquina (automatizada o semi-automatizada) o equipo de inspección que detectará el modo o la causa de la falla.'
              },
              4: {
                maturity: 'El sistema ha demostrado ser efectivo y confiable.',
                opportunity: 'Método basado en máquina que detectará el modo de falla río abajo, prevendrá el procesamiento posterior o identificará el producto como discrepante.'
              },
              3: {
                maturity: 'El sistema ha demostrado ser efectivo y confiable.',
                opportunity: 'Detección basada en máquina que detectará el modo de falla en la estación, prevendrá el procesamiento posterior o identificará el producto como discrepante.'
              },
              2: {
                maturity: 'La detección ha demostrado ser efectiva y confiable (ej. a prueba de errores).',
                opportunity: 'Detección por máquina que detectará la causa y prevendrá que se produzca el modo de falla.'
              },
              1: {
                maturity: 'El modo de falla no puede ser producido físicamente por diseño o proceso, o los métodos de detección han demostrado detectar siempre.',
                opportunity: 'El modo de falla no puede ser producido físicamente por diseño o proceso, o los métodos de detección han demostrado detectar siempre.'
              }
            }
          },
          actionPriorityMatrix: {
            title: 'Action Priority (AP)',
            headers: {
              effect: 'Efecto',
              s: '"S"',
              prediction: 'Predicción de Ocurrencia de la causa de falla',
              o: '"O"',
              ability: 'Habilidad para Detectar',
              d: '"D"',
              ap: '"AP"'
            },
            effects: {
              veryHigh: 'Efecto muy alto Producto o Planta',
              high: 'Efecto alto Producto o Planta',
              moderate: 'Efecto moderado Producto o Planta',
              low: 'Efecto Bajo Producto o Planta',
              none: 'Sin efecto discernible'
            },
            predictions: {
              veryHigh: 'Muy Alta',
              high: 'Alta',
              moderate: 'Moderada',
              low: 'Baja',
              veryLow: 'Muy Baja',
              any: 'Muy Alta - Muy Baja'
            },
            abilities: {
              lowVeryLow: 'Baja - Muy Baja',
              moderate: 'Moderada',
              high: 'Alta',
              veryHigh: 'Muy Alta',
              any: 'Muy Alta - Muy Baja'
            }
          }
        },
        moc: {
          title: 'Control de Cambios (MOC)',
          auditLog: 'Historial de Modificaciones',
          oldValue: 'Valor Anterior',
          newValue: 'Valor Nuevo',
          performedBy: 'Realizado por',
          date: 'Fecha',
        },
        tasks: {
          title: 'Bandeja de Acciones Pendientes',
          empty: 'No hay tareas pendientes asignadas a ti.',
          priority: 'Prioridad',
        },
        catalog: {
          productFamily: {
            title: 'Catálogo de Familias de Producto',
            subtitle: 'Gestiona las opciones disponibles para el PFMEA',
            name: 'Nombre de la Familia',
            description: 'Descripción (Opcional)',
            list: 'Familias Registradas',
          },
          productionLine: {
            title: 'Catálogo de Líneas de Producción',
            subtitle: 'Gestiona las opciones disponibles para el PFMEA',
            name: 'Nombre de la Línea',
            description: 'Descripción (Opcional)',
            list: 'Líneas Registradas',
          }
        }
      },
      technologies: {
        categories: {
          manageTitle: 'Gestionar Categorías',
          list: 'Lista de Categorías',
          namePlaceholder: 'Nombre de la categoría...',
          empty: 'No se encontraron categorías.',
          deleteConfirm: '¿Estás seguro de que deseas eliminar esta categoría?',
          createSuccess: 'Categoría creada con éxito',
          createError: 'Error al crear la categoría',
          updateSuccess: 'Categoría actualizada con éxito',
          updateError: 'Error al actualizar la categoría',
          deleteSuccess: 'Categoría eliminada con éxito',
          deleteError: 'Error al eliminar la categoría'
        },
        pageTitle: 'Gestión de Tecnologías',
        loading: 'Cargando tecnologías...',
        error: 'Error al cargar las tecnologías. Intente de nuevo.',
        form: {
          createTitle: 'Crear Tecnología',
          editTitle: 'Editar Tecnología',
          name: 'Nombre',
          category: 'Categoría',
          selectCategory: 'Seleccione categoría...',
          description: 'Descripción',
          parameters: 'Parámetros Críticos',
          addParameter: 'Agregar parámetro',
          noParameters: 'Sin parámetros definidos. Agregue uno con el botón de arriba.',
          paramName: 'Nombre del parámetro',
          paramUnit: 'Unidad',
          paramTarget: 'Objetivo',
          paramMin: 'Mínimo',
          paramMax: 'Máximo',
          paramCritical: 'CC',
          submit: 'Guardar',
          cancel: 'Cancelar',
        },
        table: {
          id: 'ID',
          name: 'Nombre',
          category: 'Categoría',
          parameters: 'Parámetros',
          createdBy: 'Creado por',
          updatedAt: 'Última Modif.',
          actions: 'Acciones',
          search: 'Buscar tecnología...',
          allCategories: 'Todas las categorías',
          filterCategory: 'Filtrar por categoría',
          empty: 'No hay tecnologías que coincidan con la búsqueda.',
          expandTooltip: 'Ver parámetros de proceso',
          statsTotalTechs: 'Tecnologías Totales',
          statsCriticalParams: 'Parámetros Críticos (CC)',
          statsActiveCategories: 'Categorías Activas',
          statsSubTotal: 'registradas',
          statsSubCritical: 'en la planta',
          statsSubCategories: 'en el catálogo',
        },
        deleteModal: {
          title: 'Eliminar tecnología',
          loading: 'Verificando dependencias...',
          message: '"{{name}}" está asociada a {{flowcharts}} diagramas y {{products}} productos.',
          confirm: 'Sí, eliminar',
          blocked: 'No se puede eliminar: la tecnología tiene dependencias activas.',
        },
        toast: {
          createSuccess: 'Tecnología creada exitosamente',
          updateSuccess: 'Tecnología actualizada exitosamente',
          deleteSuccess: 'Tecnología eliminada exitosamente',
          createError: 'Error al crear la tecnología',
          updateError: 'Error al actualizar la tecnología',
          deleteError: 'Error al eliminar la tecnología',
        },
        parameters: {
          manage: 'Gestión de Parámetros Maestros',
          manageTooltip: 'Gestionar Parámetros Maestros',
          empty: 'No hay parámetros definidos para esta tecnología.',
          saveSuccess: 'Parámetros guardados exitosamente',
          saveError: 'Error al guardar los parámetros',
        },
      },
      // ─── Product Versioning ──────────────────────
      productVersioning: {
        historyTitle: 'Historial de Cambios',
        errorFetchingHistory: 'Error al cargar el historial.',
        noHistory: 'No hay historial de cambios disponible.',
        engineeringLevel: 'Nivel de Ingeniería',
        engineeringLevelPlaceholder: 'Ej. Rev B',
        changeReason: 'Motivo del Cambio',
        changeReasonPlaceholder: 'Describe brevemente los cambios',
        createRevisionTitle: 'Crear Nueva Revisión',
        createRevisionBtn: 'Crear Revisión',
        errorRequiredFields: 'Todos los campos son obligatorios.',
        errorCreatingRevision: 'Error al crear la nueva versión.',
        statusDraft: 'Borrador',
        statusInReview: 'En Revisión',
        statusReleased: 'Liberado',
        statusArchived: 'Archivado',
        sendToReview: 'Solicitar Revisión',
        release: 'Aprobar & Liberar',
      },


      measurementUnits: {
        pageTitle: 'Unidades de Medida',
        subtitle: 'Catálogo de unidades de medida para los parámetros de producto',
        newButton: 'Nueva Unidad',
        loading: 'Cargando unidades...',
        noResults: 'No hay unidades de medida registradas.',
        table: {
          description: 'DESCRIPCIÓN',
          symbology: 'SÍMBOLO',
          magnitude: 'MAGNITUD',
          actions: 'ACCIONES',
        },
        actions: {
          edit: 'Editar',
          delete: 'Eliminar',
        },
        form: {
          createTitle: 'Nueva Unidad de Medida',
          editTitle: 'Editar Unidad',
          description: 'Descripción',
          descriptionPlaceholder: 'Ej. Kilogramo',
          symbology: 'Símbolo',
          symbologyPlaceholder: 'Ej. kg',
          magnitude: 'Magnitud',
          magnitudePlaceholder: 'Ej. Masa',
          cancel: 'Cancelar',
          save: 'Guardar Unidad',
          saving: 'Guardando...',
        },
        confirmDelete: '¿Estás seguro de que deseas eliminar la unidad {{name}}?',
        toast: {
          createSuccess: 'Unidad creada exitosamente',
          createError: 'Error al crear la unidad',
          updateSuccess: 'Unidad actualizada exitosamente',
          updateError: 'Error al actualizar la unidad',
          deleteSuccess: 'Unidad eliminada exitosamente',
          deleteError: 'Error al eliminar la unidad',
        }
      },
      locations: {
        pageTitle: 'Ubicaciones',
        subtitle: 'Gestiona las ubicaciones físicas y áreas de manufactura.',
        newButton: 'Nueva Ubicación',
        loading: 'Cargando ubicaciones...',
        noResults: 'No hay ubicaciones registradas.',
        table: {
          code: 'CÓDIGO',
          name: 'NOMBRE',
          type: 'TIPO',
          description: 'DESCRIPCIÓN',
          actions: 'ACCIONES',
        },
        actions: {
          edit: 'Editar',
          delete: 'Eliminar',
        },
        form: {
          createTitle: 'Nueva Ubicación',
          editTitle: 'Editar Ubicación',
          code: 'Código',
          codePlaceholder: 'Ej. L-01',
          type: 'Tipo',
          typePlaceholder: 'Línea, Celda...',
          name: 'Nombre de la Ubicación',
          namePlaceholder: 'Línea de Ensamble Final',
          description: 'Descripción (Opcional)',
          descriptionPlaceholder: 'Detalles adicionales sobre esta ubicación...',
          cancel: 'Cancelar',
          save: 'Guardar Ubicación',
          saving: 'Guardando...',
        },
        confirmDelete: '¿Estás seguro de que deseas eliminar la ubicación {{name}}?',
        toast: {
          createSuccess: 'Ubicación creada exitosamente',
          createError: 'Error al crear la ubicación',
          updateSuccess: 'Ubicación actualizada exitosamente',
          updateError: 'Error al actualizar la ubicación',
          deleteSuccess: 'Ubicación eliminada exitosamente',
          deleteError: 'Error al eliminar la ubicación',
        },
      },

      // ─── Products ────────────────────────────────
      product: {
        customer: 'Cliente',
        selectCustomer: 'Seleccionar cliente...',
        partNumber: 'Número de Parte',
        partNumberPlaceholder: 'Ej. PP1674201002',
        technologies: 'Tecnologías',
        description: 'Descripción del Producto',
        descriptionPlaceholder: 'Ej. Alfombra Delantera',
        engineeringLevel: 'Nivel de Ingeniería',
        drawing: 'Dibujo',
        stage: 'Etapa',
        selectStage: 'Seleccionar etapa...',
        stagePrototype: 'Prototipo',
        stagePreseries: 'Pre series',
        stageProduction: 'Producción',
        image: 'Imagen',
      },
      products: {
        title: 'Gestión de Productos',
        subtitle: 'Catálogo de productos y tecnologías',
        searchPlaceholder: 'Buscar por número de parte o cliente...',
        viewGrid: 'Vista de cuadrícula',
        viewTable: 'Vista de tabla',
        emptyState: 'No hay productos registrados.',
        goToCreate: 'Ir a gestión de productos',
        filters: {
          allStatuses: 'Todos los estados',
          allCustomers: 'Todos los clientes',
        },
        step1: {
          title: 'Datos Generales',
        },
        step2: {
          title: 'Especificaciones y Tecnologías',
        },
        actions: {
          create: 'Nuevo Producto',
          edit: 'Editar',
          delete: 'Eliminar',
          save: 'Guardar Cambios',
        },
        form: {
          partNumber: 'Número de Parte',
          partNumberRequired: 'El número de parte es obligatorio',
          customerPartNumber: 'Número de Parte (Cliente)',
          description: 'Descripción',
          customer: 'Cliente',
          technologies: 'Tecnologías',
          technologiesRequired: 'Debe seleccionar al menos una tecnología para el producto.',
          status: 'Estatus',
          dimensions: 'Dimensiones',
          dimensionsPlaceholder: 'Ej. 1540 x 280 x 62 mm',
          weight: 'Peso (kg)',
          weightPlaceholder: 'Ej. 2.65',
          cycleTime: 'Tiempo de Ciclo (s)',
          cycleTimePlaceholder: 'Ej. 88',
          ratePerHour: 'Piezas / Hora (pz/hr)',
          ratePerHourPlaceholder: 'Ej. 40',
          productFamily: 'Familia de Producto',
          productionLine: 'Línea de Producción',
        },
        toast: {
          createSuccess: 'Producto creado exitosamente',
          createError: 'Error al crear el producto',
          updateSuccess: 'Producto actualizado exitosamente',
          updateError: 'Error al actualizar el producto',
          deleteSuccess: 'Producto eliminado exitosamente',
          deleteError: 'Error al eliminar el producto',
        },
        detail: {
          masterData: 'Datos Maestros',
          traceability: 'Trazabilidad',
          technologies: 'Tecnologías',
          addTechnology: 'Añadir Tecnología',
          parameters: 'Parámetros',
          specs: 'Dimensiones y Especificaciones',
          specsCards: {
            dimensions: 'DIMENSIONES',
            weight: 'PESO (KG)',
            cycleTime: 'TIEMPO CICLO',
            ratePerHour: 'RATE / HORA',
          }
        },
        deleteModal: {
          title: '¿Eliminar este producto?',
          message: 'Se eliminará el producto "{{partNumber}}". Esta acción no se puede deshacer.',
        },
        parameters: {
          title: 'Gestión de Parámetros de Control',
          add: 'Añadir Parámetro',
          requiresTechnology: 'Debe definir al menos una tecnología para agregar parámetros.',
          save: 'Guardar Cambios',
          empty: 'No hay parámetros definidos para este producto.',
          startAdding: 'Comenzar a añadir parámetros',
          saveSuccess: 'Parámetros guardados exitosamente',
          saveError: 'Error al guardar los parámetros',
          table: {
            name: 'Nombre',
            unit: 'Unidad',
            min: 'Mínimo',
            target: 'Objetivo',
            max: 'Máximo',
            namePlaceholder: 'Ej. Temperatura',
            critical: 'Crítico',
            minPlaceholder: 'Mín',
            targetPlaceholder: 'Obj',
            maxPlaceholder: 'Máx',
          }
        }
      },
      
      // ─── RBAC ────────────────────────────────────
      rbac: {
        readOnlyMode: 'Modo solo lectura. No tienes permisos para editar.',
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
        responsibleDepartment: 'Responsable',
        operation: 'Operación / Tecnología',
        machinery: 'Maquinaria',
        location: 'Ubicación',
        locationPlaceholder: 'Ubicación...',
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
        auto_control: 'Autocontrol',
        pokayoke: 'Poka-Yoke',
      },

      // ─── Departments ───────────────────────────
      departments: {
        Calidad: 'Calidad',
        Producción: 'Producción',
        Logística: 'Logística',
        Materiales: 'Materiales',
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
        add: 'Agregar',
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
          // Categorías predefinidas
          Inyección: 'Inyección',
          Ensamble: 'Ensamble',
          Torque: 'Torque',
          Soldadura: 'Soldadura',
          Estampado: 'Estampado',
          Pintura: 'Pintura',
          Corte: 'Corte',
          'Tratamiento Térmico': 'Tratamiento Térmico',
          // Alternativas en minúsculas
          inyección: 'Inyección',
          ensamble: 'Ensamble',
          torque: 'Torque',
          soldadura: 'Soldadura',
          estampado: 'Estampado',
          pintura: 'Pintura',
          corte: 'Corte',
          'tratamiento térmico': 'Tratamiento Térmico',
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

      // ─── Auxiliaries & Navbar ────────────────────

      machinery: {
        subtitle: 'Gestión de la maquinaria utilizada en las operaciones (vinculado al Diagrama de Flujo).',
        actions: {
          create: 'Nueva Maquinaria'
        },
        modal: {
          createTitle: 'Registrar Maquinaria',
          editTitle: 'Editar Maquinaria'
        },
        form: {
          assetCode: 'Código de Activo',
          assetCodePlaceholder: 'ej. INJ-04',
          status: 'Estatus',
          statusActive: 'Activo',
          statusInactive: 'Inactivo',
          name: 'Nombre de Maquinaria',
          namePlaceholder: 'ej. Inyectora 500T',
          plant: 'Planta',
          plantDefault: '1 - Default',
          location: 'Ubicación (Opcional)',
          locationSelect: '-- Seleccionar ubicación --',
          cancel: 'Cancelar',
          saving: 'Guardando...',
          submitCreate: 'Crear Maquinaria',
          submitUpdate: 'Actualizar Maquinaria',
          errors: {
            codeRequired: 'El código es requerido',
            codeInvalid: 'Formato inválido. Use letras, números y guiones.',
            nameRequired: 'El nombre es requerido',
            plantRequired: 'Planta es requerida'
          }
        }
      },
      customers: {
        subtitle: 'Administrar registros de clientes y datos asociados.',
        actions: {
          create: 'Nuevo Cliente'
        },
        safety: {
          title: 'Característica de Seguridad',
          description: 'Símbolo obligatorio para la cabecera de documentación del proyecto (Diagramas, PFMEA, Control Plan).',
          required: 'Debes seleccionar una opción',
          options: {
            daimler: 'Seguridad / Daimler',
            critical: 'Seguridad-Crítico',
            certification: 'Certificación',
            vw: 'Doc. obligatoria / VW',
            legal: 'Legal / Ambiental',
            ford: 'Safety Item / Ford'
          }
        }
      },
      /* duplicate blocks
      locations: {
        pageTitle: 'Ubicaciones',
        subtitle: 'Plantas, naves y ubicaciones de manufactura.',
        newButton: 'Nueva Ubicación',
        confirmDelete: '¿Eliminar la ubicación {{name}}?',
        toast: {
          createSuccess: 'Ubicación creada con éxito',
          createError: 'Error al crear ubicación',
          updateSuccess: 'Ubicación actualizada con éxito',
          updateError: 'Error al actualizar ubicación',
          deleteSuccess: 'Ubicación eliminada con éxito',
          deleteError: 'Error al eliminar ubicación'
        },
        form: {
          createTitle: 'Nueva Ubicación',
          editTitle: 'Editar Ubicación',
          code: 'Código',
          codePlaceholder: 'Ej: NAVE1',
          type: 'Tipo',
          typePlaceholder: 'Ej: Nave, Edificio',
          name: 'Nombre',
          namePlaceholder: 'Nombre descriptivo',
          description: 'Descripción',
          descriptionPlaceholder: 'Opcional',
          cancel: 'Cancelar',
          saving: 'Guardando...',
          save: 'Guardar'
        }
      },
      technologies: {
        categories: {
          manageTitle: 'Gestionar Categorías',
          list: 'Lista de Categorías',
          namePlaceholder: 'Nombre de la categoría...',
          empty: 'No se encontraron categorías.',
          deleteConfirm: '¿Estás seguro de que deseas eliminar esta categoría?',
          createSuccess: 'Categoría creada con éxito',
          createError: 'Error al crear la categoría',
          updateSuccess: 'Categoría actualizada con éxito',
          updateError: 'Error al actualizar la categoría',
          deleteSuccess: 'Categoría eliminada con éxito',
          deleteError: 'Error al eliminar la categoría'
        },
        pageTitle: 'Tecnologías',
        form: {
          createTitle: 'Nueva Tecnología',
          editTitle: 'Editar Tecnología',
          name: 'Nombre de la Tecnología',
          category: 'Categoría',
          selectCategory: 'Seleccionar Categoría...',
          description: 'Descripción',
          parameters: 'Parámetros de Control',
          addParameter: 'Añadir Parámetro',
          noParameters: 'No hay parámetros definidos para esta tecnología.',
          paramName: 'Nombre del parámetro',
          paramUnit: 'Unidad',
          paramMin: 'Mínimo',
          paramTarget: 'Objetivo',
          paramMax: 'Máximo',
          paramCritical: 'Crítico',
          cancel: 'Cancelar',
          submit: 'Guardar Tecnología'
        },
        table: {
          allCategories: 'Todas las categorías',
          search: 'Buscar...',
          id: 'ID',
          name: 'NOMBRE',
          category: 'CATEGORÍA',
          parameters: 'PARÁMETROS',
          createdBy: 'CREADO POR',
          updatedAt: 'ACTUALIZADO',
          actions: 'ACCIONES',
          empty: 'No se encontraron tecnologías.',
          expandTooltip: 'Ver detalles',
          statsTotalTechs: 'Total de Tecnologías',
          statsSubTotal: 'registradas',
          statsCriticalParams: 'Parámetros Críticos',
          statsSubCritical: 'en total',
          statsActiveCategories: 'Categorías',
          statsSubCategories: 'en uso'
        },
        toast: {
          createSuccess: 'Tecnología creada con éxito',
          createError: 'Error al crear la tecnología',
          updateSuccess: 'Tecnología actualizada con éxito',
          updateError: 'Error al actualizar la tecnología',
          deleteSuccess: 'Tecnología eliminada con éxito',
          deleteError: 'Error al eliminar la tecnología'
        }
      }, */

      // ─── Export ─────────────────────────────────
      export: {
        flowchart: {
          button: 'Exportar PDF',
          generating: 'Generando PDF...',
          title: 'DIAGRAMA DE PROCESO DE FLUJO',
          columns: {
            no: 'No.',
            description: 'Descripción',
            location: 'Ubicaciones',
            hic: 'HIC',
            quality: 'Calidad',
            production: 'Producción',
            logistics: 'Logística',
            materials: 'Materiales',
            others: 'Otros',
            norm: 'Norma',
            machinery: 'Maquinaria',
          },
          header: {
            partNumber: 'Número de parte:',
            description: 'Descripción:',
            engineeringLevel: 'Nivel de Ingeniería:',
            customer: 'Cliente:',
            date: 'Fecha:',
            revision: 'Revisión:',
          },
          summary: {
            storage: 'Almacenamiento',
            autoControl: 'Auto Control',
            delay: 'Demora',
            inspection: 'Inspección',
            operation: 'Operación',
            pokayoke: 'Pokayoke',
            transport: 'Transporte',
            total: 'Total',
          },
          signatures: {
            prepared: 'Elaboró',
            approved: 'Aprobó',
            reviewed: 'Revisó',
          },
          notes: {
            deviation: 'Nota: Si existe una desviación al flujo de proceso deberá solicitar desviación al departamento de ingeniería, para su aprobación y/o evaluación.',
            specialSymbols: 'Nota: Para utilizar simbología especial, ver procedimiento PAC-06',
          },
          footer: {
            printDate: 'Fecha de impresión:',
            revisionDate: 'Fecha de Rev.:',
          },
        },
        pfmea: {
          button: 'Exportar PFMEA',
          generating: 'Generando PFMEA...',
          title: 'ANÁLISIS DE MODO Y EFECTO DE FALLA DEL PROCESO (PFMEA)',
          header: {
            partNumber: 'Número de parte:',
            description: 'Descripción:',
            project: 'Proyecto:',
            customer: 'Cliente:',
            team: 'Equipo:',
            responsible: 'Responsable del proceso:',
            pfmeaNumber: 'No. AMEF:',
            manufacturing: 'Manufactura:',
            preparedBy: 'Preparado por:',
            originalDate: 'Fecha original:',
            revisionDate: 'Fecha revisión:',
            stages: {
              prototype: 'Prototipo',
              preLaunch: 'Pre-lanzamiento',
              production: 'Producción',
            },
          },
          columns: {
            process: 'Proceso',
            operationNo: 'No. Op.',
            description: 'Descripción',
            workElement: 'Elem. de trabajo',
            functionItem: 'Func. del item de proceso',
            functionStep: 'Func. del paso del proceso',
            productChar: 'Caract. del producto',
            functionWorkElement: 'Func. del elem. de trabajo',
            processChar: 'Caract. del proceso',
            failureMode: 'Modo de falla',
            failureEffect: 'Efecto de falla (EF)',
            severityEF: '(S) EF',
            failureCause: 'Causa de falla',
            occurrenceCF: '(O) CF',
            preventionControl: 'Ctrol. Prevención CF',
            detectionControlMF: 'Ctrol. Detección MF',
            detectionControlCF: 'Ctrol. Detección CF',
            detectionMFCF: '(D) MF/CF',
            ap: 'AMEFP PA',
            hic: 'HIC',
            specialChar: 'C. Esp.',
            preventionAction: 'Acción de prevención',
            detectionAction: 'Acción de detección',
            responsible: 'Respons.',
            targetDate: 'Fecha objetivo de termino',
            status: 'Estatus',
            actionsTaken: 'Acciones tomadas',
            completionDate: 'Fecha real de término',
            newSeverity: 'Severidad (S)',
            newOccurrence: 'Ocurrencia (O)',
            newDetection: 'Detección (D)',
            newAP: 'AMEFP PA',
            observations: 'Coment.',
          },
          signatures: {
            prepared: 'Elaboró',
            approved: 'Aprobó',
            reviewed: 'Revisó',
          },
          footer: {
            printDate: 'Fecha de impresión:',
            revisionDate: 'Fecha de Rev.:',
            page: 'Página',
          },
        },
      },

    },
  },

  en: {
    translation: {
      // ─── Common ─────────────────────────────────
      common: {
        addRow: 'Add Row',
        saving: 'Saving...',
        saveChanges: 'Save Changes',
        save: 'Save',
        saved: 'Saved',
        select: 'Select...',
        cancel: 'Cancel',
        localDraft: 'Local Draft',
        localDraftDesc: 'Changes are saved in your browser until you send them to the server.',
        localDraftDescShort: 'Saved in browser',
        customer: 'Customer',
        status: 'Status',
        search: 'Search...',
        created: 'Created:',
        modified: 'Modified:',
        allPlants: 'All Plants',
        allLocations: 'All Locations',
      },
      sort: {
        newest: 'Newest',
        oldest: 'Oldest',
        aToZ: 'Name (A-Z)',
        zToA: 'Name (Z-A)',
      },

      // ─── Login ──────────────────────────────────
      login: {
        languageSwitcher: {
          es: 'ES',
          en: 'EN',
        },
        forgotPasswordLink: 'Forgot password?',
        forgotPasswordTitle: 'Recover Password',
        forgotPasswordDesc: 'Enter your email to receive a 6-digit reset code.',
        resetPasswordTitle: 'Reset Password',
        resetPasswordDesc: 'Enter the OTP code and your new password.',
        subtitle: 'APG DMS (Document Management System)',
        emailLabel: 'Plant Email Address',
        passwordLabel: 'Password',
        newPasswordLabel: 'New Password',
        otpLabel: 'Security OTP Code',
        continueButton: 'Continue',
        sendOtp: 'Send Code',
        verifyAndReset: 'Change Password',
        verifyAndAccess: 'Verify & Access',
        backToLogin: 'Back',
        otpSent: 'Code sent',
        otpSentDesc: 'Check your email. We have sent you a security OTP code.',
        otpSentText: 'We have sent a 6-digit temporary code to ',
        resendOtpTimer: 'Resend in {{seconds}}s',
        resendOtp: 'Resend Code',
        incompleteFields: 'Incomplete fields',
        incompleteFieldsDesc: 'Please fill out all fields.',
        invalidOtp: 'Invalid code',
        invalidOtpDesc: 'The OTP code must be exactly 6 digits.',
        shortPassword: 'Password too short',
        shortPasswordDesc: 'The password must be at least 8 characters long.'
      },

      // ─── App ────────────────────────────────────
      app: {
        title: 'APG DMS - Document Management System',
        subtitle: 'Process Workspace',
        breadcrumb: 'Home / Projects / Flowchart',
        documentTitle: 'APG DMS - Document Management System',
        documentDescription: 'APG DMS - Document Management System for product lifecycle control.',
      },

      // ─── Welcome ────────────────────────────────
      welcome: {
        title: 'APG Document Management System',
        subtitle: 'Quality Management Platform (DMS)',
        vision: 'Centralizes and organizes the product lifecycle aligned with VDA & AIAG methodology requirements. Unifies flowcharts, PFMEA, and control plans into a single ecosystem.',
        flowchart: {
          title: 'Flowcharts',
          description: 'Create, edit, and manage your process flowcharts with our interactive tool.',
        },
        pfmea: {
          title: 'PFMEA',
          description: 'Identify and evaluate potential failure modes systematically and professionally.',
        },
        auxiliaries: {
          title: 'Auxiliary Data',
          description: 'Manage customers, machinery, components, and operations for your projects.',
        },
        getStarted: 'Get Started',
      },

      // ─── Admin ────────────────────────────────
      admin: {
        users: {
          title: 'User Management',
          subtitle: 'Access administration, work roles, and personnel auditing for APG Puebla plant.',
          refresh: 'Refresh',
          addUser: 'Add User',
          loading: 'Loading personnel directory...',
          table: {
            staff: 'Personnel',
            email: 'Email',
            role: 'Technical Role',
            department: 'Department',
            tisax: 'TISAX Status',
            actions: 'Actions'
          },
          noUsers: 'No registered users found.',
          status: {
            active: 'Active',
            inactive: 'Inactive',
            archived: 'Archived'
          },
          actions: {
            inactivate: 'Inactivate',
            reactivate: 'Reactivate',
            edit: 'Edit'
          },
          errors: {
            restrictedAccess: 'Restricted Access',
            restrictedDesc: 'This section is exclusively reserved for Adler Pelzer Group plant Administrators. If you believe this is an error, please contact technical support.',
            loadFailed: 'Data Load Error',
            loadFailedDesc: 'Failed to load users. Verify your permissions.',
            updateRole: 'Error updating role',
            updateStatus: 'Update error',
            selfDeactivate: 'You cannot deactivate your own administrator account.',
            emailExists: 'The email is already registered in the system.',
            resendVerification: 'Error resending the link'
          },
          success: {
            roleUpdated: 'Role updated',
            roleUpdatedDesc: 'The technical role has been successfully reassigned to {{role}}.',
            statusUpdated: 'User {{status}}',
            statusUpdatedDesc: 'The user has been successfully {{action}}.',
            userCreated: 'User Created',
            userCreatedDesc: 'The new user has been registered successfully.',
            userUpdated: 'User Updated',
            userUpdatedDesc: 'User data has been successfully updated.',
            verificationResent: 'Link resent',
            verificationResentDesc: 'A new verification link has been sent (valid for 24h).'
          },
          modal: {
            createTitle: 'Register New User',
            editTitle: 'Edit User',
            createSubtitle: 'Create a new system access profile',
            editSubtitle: 'Modify data for the selected user',
            fullName: 'Full Name',
            email: 'Email Address',
            password: 'Temporary Password',
            department: 'Department',
            position: 'Position',
            role: 'System Role',
            save: 'Save User',
            cancel: 'Cancel'
          }
        }
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
          createdAt: 'Created At',
          updatedAt: 'Updated At',
          actions: 'Actions',
          emptyState: 'No flowcharts match the search criteria.',
        },
        actions: {
          create: 'New Project',
          edit: 'Edit',
          duplicate: 'Duplicate / New Rev',
          archive: 'Archive',
        },
        modal: {
          title: 'New Flowchart Project',
          subtitle: 'Enter metadata to start the flow',
          projectName: 'Project Name',
          projectNamePlaceholder: 'e.g. Audi LHD Carpets AU436',
          productInfo: 'Product Information',
          selectExisting: 'Select Existing',
          createNew: 'Create New Product',
          advancedProductManagement: 'Go to advanced product management',
          selectProduct: 'Select a Product',
          loadingProducts: 'Loading products...',
          noProducts: 'No products in database. Create a new one.',
          newProductTitle: 'New Finished Product (PT)',
          errorNoProjectName: 'Project name is required.',
          errorNoCustomerPart: 'Customer and part number are required to create a product.',
          successProductCreated: 'Product {{partNumber}} created successfully.',
          errorNoProductSelected: 'You must select a product.',
          successProjectCreated: 'Flowchart project created successfully.',
          errorCreation: 'Error creating project. Check the data.',
          createProjectBtn: 'Create Project'
        }
      },

      // ─── Archive Module ──────────────────────────
      archive: {
        modal: {
          title: 'Archive Document',
          subtitle: 'This document will be moved to the historical repository',
          reasonLabel: 'Change Reason / Obsolescence Rationale',
          reasonPlaceholder: 'Describe the reason (min. 10 characters)...',
          ecoLabel: 'ECO Number (Engineering Change Order)',
          ecoPlaceholder: 'e.g. ECO-2024-001',
          ecoOptional: 'Optional',
          confirmCheck: 'I confirm this document will be moved to the historical repository and will not be available for editing on plant terminals.',
          archiveBtn: 'Archive Document',
          cancelBtn: 'Cancel',
          metadataTitle: 'Document Information',
          docId: 'Document ID',
          docTitle: 'Title',
          docVersion: 'Current Version',
          docStatus: 'Current Status',
          docCreated: 'Creation Date',
          warningTitle: 'Irreversible Action',
          warningDesc: 'The document will be moved to the historical repository. The multidisciplinary team will be notified by email.',
        },
        banner: {
          title: 'OBSOLETE DOCUMENT',
          subtitle: 'Read only — Historical Repository',
          archivedBy: 'Archived by',
          archivedOn: 'on',
          viewHistory: 'View Full History',
          readOnly: 'This document cannot be edited.',
        },
        watermark: {
          text: 'OBSOLETE',
        },
        history: {
          title: 'Document History',
          subtitle: 'Version and audit timeline',
          timeline: 'Timeline',
          metadata: 'Archive Metadata',
          retention: 'Retention Policy',
          noHistory: 'No history records yet for this document.',
          events: {
            created: 'Document Created',
            approved: 'Document Approved',
            archived: 'Document Archived',
            revised: 'New Revision',
            inReview: 'Sent for Review',
          },
          by: 'by',
          on: 'on',
          reason: 'Reason',
          eco: 'ECO',
          version: 'Version',
          snapshotSteps: 'Recorded steps',
          metadataFields: {
            docId: 'Document ID',
            revision: 'Revision No.',
            validFrom: 'Initial Validity Date',
            archivedOn: 'Obsolescence Date',
            approver: 'Approver',
            ecoRef: 'ECO Reference',
            documentType: 'Document Type',
          },
          retentionFields: {
            title: 'Mandatory Retention Period',
            policy: 'FC/FMEA/CP: active production + 1 additional year (IATF 16949). WI: current year + 3 fiscal years.',
            minimumUntil: 'Minimum retention until',
            policyType: 'Applicable policy',
            productionDoc: 'Process/Product Document',
            workInstruction: 'Work Instruction',
            csr: 'Customer CSR may extend to 15–30 years',
          },
        },
        filter: {
          showArchived: 'Show archived',
          hideArchived: 'Hide archived',
        },
        status: {
          archived: 'Archived',
          obsolete: 'Obsolete',
        },
        errors: {
          archiveFailed: 'Error archiving document. Please try again.',
          historyLoadFailed: 'Could not load document history.',
          alreadyArchived: 'This document is already archived.',
          reasonRequired: 'Change reason is required (min. 10 characters).',
          confirmRequired: 'You must confirm the action by checking the box.',
        },
        success: {
          archived: 'Document archived. The team has been notified by email.',
        },
      },

      // ─── Navbar ──────────────────────────────────
      navbar: {
        flowchart: 'Flowchart',
        pfmea: 'PFMEA',
        products: 'Products',
        users: 'Users',
        auxiliaries: {
          title: 'Auxiliaries',
          customers: 'Customers',
          components: 'Components',
          machinery: 'Machinery',
          operations: 'Operations',
          technologies: 'Technologies',
          locations: 'Locations',
          measurementUnits: 'Measurement Units',
        },
      },
      pfmea: {
        dashboard: {
          title: 'PFMEA Inventory',
          subtitle: 'Management and control of failure mode and effects analysis',
          newButton: 'New PFMEA',
          searchPlaceholder: 'Search by name, ID or customer...',
          filters: {
            allStates: 'All statuses',
            draft: 'Draft',
            approved: 'Approved',
            archived: 'Archived'
          },
          table: {
            id: 'Doc ID',
            project: 'Project',
            partNumber: 'Part Number',
            customer: 'Customer',
            status: 'Status',
            version: 'Version',
            createdAt: 'Created At',
            updatedAt: 'Updated At',
            actions: 'Actions',
            noProjects: 'No PFMEA projects found.',
            noNumber: 'No Number'
          },
          actions: {
            edit: 'Edit',
            duplicate: 'Duplicate',
            archive: 'Archive'
          },
          errors: {
            loadFailed: 'Failed to load PFMEAs. Check your connection.',
            loadFlowchartsFailed: 'Failed to load flowcharts.',
            projectNameRequired: 'Project name is required.',
            flowchartRequired: 'You must select a base Flowchart.',
            createFailed: 'Error creating project. Check the data.'
          },
          success: {
            created: 'PFMEA Project created successfully.'
          },
          noCustomer: 'No Customer Specified',
          retry: 'Retry',
          modal: {
            title: 'New PFMEA',
            subtitle: 'Link to a Flowchart and Product',
            projectName: 'Project Name',
            projectPlaceholder: 'e.g. Audi Carpets PFMEA',
            flowchartBase: 'Base Flowchart',
            loadingFlowcharts: 'Loading flowcharts...',
            noFlowcharts: 'No flowcharts available.',
            cancel: 'Cancel',
            createProject: 'Create Project'
          }
        },
        team: {
          addMember: 'Add Team Member',
          addMemberDesc: 'Assign users to the multidisciplinary team',
          selectUser: 'Select User',
          role: 'Role in Team',
          department: 'Department',
          addSuccess: 'Member added successfully',
          userAlreadyInTeam: 'User {{userName}} is already in the team under the {{department}} department.',
          addError: 'Error adding team member.',
          loadingUsers: 'Loading users...',
          deptFromProfile: 'The department is assigned from the user profile',
          roleFromProfile: 'The role is assigned from the user profile'
        },
        header: {
          title: 'PFMEA Project Information',
          coreTeam: 'Core Team',
          addMember: 'Add Member',
          syncFlowchart: 'Sync Flowchart',
          mocStatus: 'MOC Status',
          projectMetadata: 'Metadata',
          unsavedChanges: 'Unsaved changes',
          description: 'Description / Project Name',
          partNumber: 'Part Number',
          customer: 'Customer',
          plantRegion: 'Plant / Region (Catalog)',
          creationDate: 'Creation Date',
          revisionDate: 'Revision Date',
          revision: 'Revision',
          status: 'Status',
          docCode: 'Cover Code / DOC',
          companyLogo: 'Company Logo',
          clickToUpdateLogo: 'Click to update logo',
          manageAux: 'Manage Auxiliary Values',
          hideAux: 'Hide Auxiliary Values',
          productFamily: 'Product Family',
          editCatalog: 'Edit Catalog',
          productionLine: 'Production Line',
          confidentiality: 'Confidentiality',
          public: 'Public',
          internal: 'Internal',
          confidential: 'Confidential',
          strictlyConfidential: 'Strictly Confidential',
          processSymbolConfig: 'Process Diagram Symbology'
        },
        editor: {
          invalidId: 'Invalid ID',
          backToInventory: 'Back to Inventory',
          loadingProject: 'Loading PFMEA project...',
          docNotFound: 'Document not found',
          docNotFoundDesc: 'The requested PFMEA project does not exist or you do not have access.',
          docId: 'Document ID',
          inEdition: 'Editing',
          tabs: {
            worksheet: 'Worksheet',
            myTasks: 'My Tasks',
            moc: 'MOC (Change Control)'
          },
          loadingTasks: 'Loading tasks...',
          loadingHistory: 'Loading history...',
          success: {
            headerUpdated: 'Header updated successfully',
            worksheetSaved: 'Worksheets saved successfully'
          },
          error: {
            headerUpdate: 'Error updating the header',
            worksheetSave: 'Error saving worksheets'
          }
        },
        worksheet: {
          title: 'PFMEA Worksheet',
          structure: 'Structure Analysis',
          function: 'Function Analysis',
          failure: 'Failure Analysis',
          risk: 'Risk Analysis',
          optimization: 'Optimization',
          steps: {
            step1: 'Step 1: Planning and Preparation',
            step2: 'Step 2: Structure Analysis',
            step3: 'Step 3: Function Analysis',
            step4: 'Step 4: Failure Analysis',
            step5: 'Step 5: Risk Analysis',
            step6: 'Step 6: Optimization',
            step1Desc: 'Project definition, core team and scope.',
            step2Desc: 'Identification of process items.',
            step3Desc: 'Functions and characteristics.',
            step4Desc: 'Effects, modes, and causes.',
            step5Desc: 'Prevention and detection controls.',
            step6Desc: 'Improvement actions and responsibles.',
          },
          columns: {
            processItem: '1. Process Element',
            station: '2. Process Step / Station',
            workElement: '3. Work Element',
            functionItemPlant: '1. Process item funct.',
            functionStepProduct: '2.a Process step funct.',
            productCharacteristic: '2.b Product char.',
            functionWorkElementChar: '3.a Work elem. funct.',
            processCharacteristic: '3.b Process char.',
            functionStep: 'Function/Req.',
            failureMode: 'Failure Mode',
            failureEffect: 'Effect',
            failureEffectCol: '1. Effects (FE)',
            failureModeCol: '2. Modes (FM)',
            failureCauseCol: '3. Causes (FC)',
            severity: 'S',
            failureCause: 'Cause',
            occurrence: 'O',
            prevention: 'Prev. Control (PC)',
            detectionCtrl: 'Det. Control (DC)',
            detection: 'D',
            ap: 'PFMEA AP',
            specialCharacteristics: 'Special Char.',
            optPrevention: 'Prev. Action',
            optDetection: 'Det. Action',
            optResponsible: 'Responsible',
            optTargetDate: 'Target Date',
            optStatus: 'Status',
            optActionsTaken: 'Actions (Evidence)',
            optCompletionDate: 'Comp. Date',
            optSeverity: 'S',
            optOccurrence: 'O',
            optDetectionVal: 'D',
            optSpecialCharacteristics: 'Special Char.',
            optAP: 'PFMEA AP',
            optObservations: 'Observations',
            responsible: 'Responsible',
            targetDate: 'Target Date',
            status: 'Status',
          },
          abbr: {
            processItem: 'P. Item',
            station: 'Station',
            workElement: '4M',
            functionItemPlant: 'Fn. Item',
            functionStepProduct: '2.a Fn. Step',
            productCharacteristic: '2.b Prod. Char.',
            functionWorkElementChar: '3.a Fn. Work.',
            processCharacteristic: '3.b Proc. Char.',
            failureEffectCol: 'Fail. Eff.',
            severity: 'S',
            failureModeCol: 'Fail. Mode',
            failureCauseCol: 'Fail. Cause',
            prevention: 'Prev.',
            occurrence: 'O',
            detectionCtrl: 'Detec.',
            detection: 'D',
            ap: 'AP',
            specialCharacteristics: 'Sp. Char.',
            optPrevention: 'Prev. Act.',
            optDetection: 'Detec. Act.',
            optResponsible: 'Resp.',
            optTargetDate: 'Date',
            optStatus: 'Stat.',
            optActionsTaken: 'Evid.',
            optCompletionDate: 'End',
            optSeverity: 'S',
            optOccurrence: 'O',
            optDetectionVal: 'D',
            optSpecialCharacteristics: 'S.C.',
            optAP: 'AP',
            optObservations: 'Obs.',
          },
          labels: {
            plantInternal: 'Plant (Internal)',
            customerPlant: 'Customer Plant (External)',
            endUser: 'End User',
          },
          options: {
            '4m': {
              machine: 'Machine',
              manpower: 'Manpower',
              material: 'Material',
              environment: 'Environment',
              method: 'Method',
              measurement: 'Measurement',
            }
          },
          emptySync: 'No analysis steps found. Sync with flowchart to begin.',
          emptySyncTitle: 'No analysis steps yet',
          emptySyncDesc: 'The document is empty. Sync with the flowchart to start the analysis or add a new row manually.',
          validationError: 'Please complete all required fields (Steps 2 to 5).',
          status: {
            open: 'Open',
            inProgress: 'In Progress',
            completed: 'Completed'
          },
          severityCriteria: {
            title: 'Process General Evaluation Severity (S) Criteria',
            headers: {
              s: '"S"',
              effect: 'Effect',
              impactPlant: 'Impact to your plant',
              impactShip: 'Impact to ship-to-plant (when known)',
              impactEndUser: 'Impact to End User (when known)',
            },
            levels: {
              high: 'High',
              modHigh: 'Moderately High',
              modLow: 'Moderately Low',
              low: 'Low',
              veryLow: 'Very Low',
            },
            descriptions: {
              10: {
                plant: 'Failure may result in an acute health and/or safety risk for the manufacturing or assembly worker.',
                ship: 'Failure may result in an acute health and/or safety risk for the manufacturing or assembly worker.',
                endUser: 'Affects safe operation of the vehicle and/or other vehicles, the health of driver or passenger(s) or road users or pedestrians.'
              },
              9: {
                plant: 'Failure may result in in-plant regulatory noncompliance.',
                ship: 'Failure may result in in-plant regulatory noncompliance.',
                endUser: 'Noncompliance with regulations.'
              },
              8: {
                plant: '100% of production run affected may be scrapped. Failure may result in in-plant regulatory noncompliance or may have a chronic health and/or safety risk for the manufacturer or assembly worker.',
                ship: 'Line shutdown greater than normal production shift; Stop shipment possible; field repair or replacement required (Assembly to End User) other than for regulatory noncompliance. Failure may result in in-plant regulatory noncompliance or may have a chronic health and/or safety risk for the manufacturer or assembly worker.',
                endUser: 'Loss of primary vehicle function necessary for normal driving during expected service life.'
              },
              7: {
                plant: 'Production may have to be sorted and a portion (less than 100% scrapped). Deviation from primary process. Decreased from line speed or added manpower.',
                ship: 'Line shutdown from one hour up to full production shift; Stop shipment possible; field repair or replacement required (Assembly to End User) other than for regulatory noncompliance.',
                endUser: 'Degradation of primary vehicle function necessary for normal driving during expected service life.'
              },
              6: {
                plant: '100% of production may have to be reworked off line and accepted.',
                ship: 'Line shutdown up to one hour.',
                endUser: 'Loss of secondary vehicle function.'
              },
              5: {
                plant: 'A portion of the production run may have to be reworked and accepted.',
                ship: 'Less than 100% of product affected; strong possibility for additional defective product; sort required; no line shutdown.',
                endUser: 'Degradation of secondary vehicle function.'
              },
              4: {
                plant: '100% of production run may have to be reworked in station before it is processed.',
                ship: 'Defective product triggers significant reaction plan; additional defective products not likely; sort not required.',
                endUser: 'Very objectionable appearance, sound, vibration, harshness, or haptics.'
              },
              3: {
                plant: 'A portion of the production run may have to be reworked in station before it is processed.',
                ship: 'Defective product triggers minor reaction plan; additional defective products not likely; sort not required.',
                endUser: 'Moderately objectionable appearance, sound, vibration, harshness, or haptics.'
              },
              2: {
                plant: 'Slight inconvenience.',
                ship: 'Defective product triggers no reaction plan; additional defective products not likely; sorts not required; requires feedback to supplier.',
                endUser: 'Slightly objectionable appearance, sound, vibration, harshness, or haptics.'
              },
              1: {
                plant: 'No discernible effect.',
                ship: 'No discernible effect or no effect.',
                endUser: 'No discernible effect.'
              }
            }
          },
          occurrenceCriteria: {
            title: 'Occurrence Potential (O) for the Process',
            headers: {
              o: '"O"',
              prediction: 'Prediction of failure cause occurring',
              typeOfControl: 'Type of Control',
              preventionControls: 'Prevention Controls'
            },
            levels: {
              extremelyHigh: 'Extremely High',
              veryHigh: 'Very High',
              high: 'High',
              moderate: 'Moderate',
              low: 'Low',
              veryLow: 'Very Low',
              extremelyLow: 'Extremely Low'
            },
            descriptions: {
              10: {
                type: 'None',
                prevention: 'No prevention controls.'
              },
              9: {
                type: 'Behavioral',
                prevention: 'Prevention Controls will have little effect in preventing failure cause.'
              },
              8: {
                type: 'Behavioral',
                prevention: 'Prevention Controls will have little effect in preventing failure cause.'
              },
              7: {
                type: '',
                prevention: 'Prevention controls somewhat effective in preventing the failure cause.'
              },
              6: {
                type: '',
                prevention: 'Prevention controls somewhat effective in preventing the failure cause.'
              },
              5: {
                type: 'Behavioral or Technical',
                prevention: 'Prevention controls are effective in preventing the failure cause.'
              },
              4: {
                type: 'Behavioral or Technical',
                prevention: 'Prevention controls are effective in preventing the failure cause.'
              },
              3: {
                type: 'Best Practices: Behavioral or Technical',
                prevention: 'Prevention controls are highly effective in preventing the failure cause.'
              },
              2: {
                type: 'Best Practices: Behavioral or Technical',
                prevention: 'Prevention controls are highly effective in preventing the failure cause.'
              },
              1: {
                type: 'Technical',
                prevention: 'Prevention controls are extremely effective in preventing the failure cause due to design (e.g. Part geometry) or process (e.g. Fixture or Tool design). Intent of prevention controls - Failure Mode cannot be physically produced due to the Failure Cause.'
              }
            }
          },
          detectionCriteria: {
            title: 'Detection Potential (D) for the Validation of the Process Design',
            headers: {
              d: '"D"',
              ability: 'Ability to Detect',
              maturity: 'Detection Method maturity',
              opportunity: 'Opportunity for Detection'
            },
            levels: {
              veryLow: 'Very Low',
              low: 'Low',
              moderate: 'Moderate',
              high: 'High',
              veryHigh: 'Very High'
            },
            descriptions: {
              10: {
                maturity: 'No testing or inspection method has been established or is known.',
                opportunity: 'The failure mode will not or cannot be detected.'
              },
              9: {
                maturity: 'It is unlikely that the testing or inspection method will detect the failure mode.',
                opportunity: 'The failure mode is not easily detected through random or sporadic audits.'
              },
              8: {
                maturity: 'Test or inspection method has not been proven to be effective and reliable.',
                opportunity: 'Human inspection (visual, tactile, audible), or use of manual gauging (attribute or variable) that should detect the failure mode or failure cause.'
              },
              7: {
                maturity: 'Test or inspection method has not been proven to be effective and reliable.',
                opportunity: 'Machine-based detection (automated or semi-automated) or use of inspection equipment that should detect failure mode or failure cause.'
              },
              6: {
                maturity: 'Test or inspection method has been proven to be effective and reliable.',
                opportunity: 'Human inspection (visual, tactile, audible), or use of manual gauging (attribute or variable) that will detect the failure mode or failure cause.'
              },
              5: {
                maturity: 'Test or inspection method has been proven to be effective and reliable.',
                opportunity: 'Machine-based detection (automated or semi-automated) or use of inspection equipment that will detect failure mode or failure cause.'
              },
              4: {
                maturity: 'System has been proven to be effective and reliable.',
                opportunity: 'Machine based method that will detect the failure mode downstream, prevent further processing or system will identify the product as discrepant.'
              },
              3: {
                maturity: 'System has been proven to be effective and reliable.',
                opportunity: 'Machine based detection that will detect the failure mode in-station, prevent further processing, or system will identify the product as discrepant.'
              },
              2: {
                maturity: 'Detection has been proven to be effective and reliable (e.g. error-proofing).',
                opportunity: 'Machine detection that will detect the cause and prevent the failure mode (discrepant part) from being produced.'
              },
              1: {
                maturity: 'Failure mode cannot be physically produced as-designed or processed, or detection methods proven to always detect.',
                opportunity: 'Failure mode cannot be physically produced as-designed or processed, or detection methods proven to always detect.'
              }
            }
          },
          actionPriorityMatrix: {
            title: 'Action Priority (AP)',
            headers: {
              effect: 'Effect',
              s: '"S"',
              prediction: 'Prediction of failure cause occurring',
              o: '"O"',
              ability: 'Ability to Detect',
              d: '"D"',
              ap: '"AP"'
            },
            effects: {
              veryHigh: 'Effect very high Product or Plant',
              high: 'Effect high Product or Plant',
              moderate: 'Effect moderate Product or Plant',
              low: 'Effect Low Product or Plant',
              none: 'No discernable effect'
            },
            predictions: {
              veryHigh: 'Very High',
              high: 'High',
              moderate: 'Moderate',
              low: 'Low',
              veryLow: 'Very Low',
              any: 'Very High - Very Low'
            },
            abilities: {
              lowVeryLow: 'Low - Very Low',
              moderate: 'Moderate',
              high: 'High',
              veryHigh: 'Very High',
              any: 'Very High - Very Low'
            }
          }
        },
        moc: {
          title: 'Management of Change (MOC)',
          auditLog: 'Audit Log',
          oldValue: 'Old Value',
          newValue: 'New Value',
          performedBy: 'Performed By',
          date: 'Date',
        },
        tasks: {
          title: 'My Pending Tasks',
          empty: 'No pending tasks assigned to you.',
          priority: 'Priority',
        },
        catalog: {
          productFamily: {
            title: 'Product Family Catalog',
            subtitle: 'Manage the available options for PFMEA',
            name: 'Family Name',
            description: 'Description (Optional)',
            list: 'Registered Families',
          },
          productionLine: {
            title: 'Production Line Catalog',
            subtitle: 'Manage the available options for PFMEA',
            name: 'Line Name',
            description: 'Description (Optional)',
            list: 'Registered Lines',
          }
        }
      },

      // ─── Technologies ─────────────────────────────
      technologies: {
        categories: {
          manageTitle: 'Manage Categories',
          list: 'Categories List',
          namePlaceholder: 'Category name...',
          empty: 'No categories found.',
          deleteConfirm: 'Are you sure you want to delete this category?',
          createSuccess: 'Category created successfully',
          createError: 'Error creating category',
          updateSuccess: 'Category updated successfully',
          updateError: 'Error updating category',
          deleteSuccess: 'Category deleted successfully',
          deleteError: 'Error deleting category'
        },
        pageTitle: 'Technology Management',
        loading: 'Loading technologies...',
        error: 'Failed to load technologies. Please try again.',
        form: {
          createTitle: 'Create Technology',
          editTitle: 'Edit Technology',
          name: 'Name',
          category: 'Category',
          selectCategory: 'Select category...',
          description: 'Description',
          parameters: 'Critical Parameters',
          addParameter: 'Add parameter',
          noParameters: 'No parameters defined. Add one using the button above.',
          paramName: 'Parameter name',
          paramUnit: 'Unit',
          paramTarget: 'Target',
          paramMin: 'Min',
          paramMax: 'Max',
          paramCritical: 'CC',
          submit: 'Save',
          cancel: 'Cancel',
        },
        table: {
          id: 'ID',
          name: 'Name',
          category: 'Category',
          parameters: 'Parameters',
          createdBy: 'Created by',
          updatedAt: 'Last Modified',
          actions: 'Actions',
          search: 'Search technology...',
          allCategories: 'All categories',
          filterCategory: 'Filter by category',
          empty: 'No technologies match the search criteria.',
          expandTooltip: 'View process parameters',
          statsTotalTechs: 'Total Technologies',
          statsCriticalParams: 'Critical Parameters (CC)',
          statsActiveCategories: 'Active Categories',
          statsSubTotal: 'registered',
          statsSubCritical: 'in the plant',
          statsSubCategories: 'in catalog',
        },
        deleteModal: {
          title: 'Delete Technology',
          loading: 'Checking dependencies...',
          message: '"{{name}}" is linked to {{flowcharts}} flowcharts and {{products}} products.',
          confirm: 'Yes, delete',
          blocked: 'Cannot delete: technology has active dependencies.',
        },
        toast: {
          createSuccess: 'Technology created successfully',
          updateSuccess: 'Technology updated successfully',
          deleteSuccess: 'Technology deleted successfully',
          createError: 'Failed to create technology',
          updateError: 'Failed to update technology',
          deleteError: 'Failed to delete technology',
        },
        parameters: {
          manage: 'Master Parameters Management',
          manageTooltip: 'Manage Master Parameters',
          empty: 'No parameters defined for this technology.',
          saveSuccess: 'Parameters saved successfully',
          saveError: 'Error saving parameters',
        },
      },
      // ─── Product Versioning ──────────────────────
      productVersioning: {
        historyTitle: 'Change History',
        errorFetchingHistory: 'Error loading history.',
        noHistory: 'No change history available.',
        engineeringLevel: 'Engineering Level',
        engineeringLevelPlaceholder: 'E.g. Rev B',
        changeReason: 'Change Reason',
        changeReasonPlaceholder: 'Briefly describe the changes',
        createRevisionTitle: 'Create New Revision',
        createRevisionBtn: 'Create Revision',
        errorRequiredFields: 'All fields are required.',
        errorCreatingRevision: 'Error creating the new version.',
        statusDraft: 'Draft',
        statusInReview: 'In Review',
        statusReleased: 'Released',
        statusArchived: 'Archived',
        sendToReview: 'Send for Review',
        release: 'Approve & Release',
      },

      // ─── Products ────────────────────────────────
      product: {
        customer: 'Customer',
        selectCustomer: 'Select customer...',
        partNumber: 'Part Number',
        partNumberPlaceholder: 'e.g. PP1674201002',
        technologies: 'Technologies',
        description: 'Product Description',
        descriptionPlaceholder: 'e.g. Front Carpets LHD',
        engineeringLevel: 'Engineering Level',
        drawing: 'Drawing',
        stage: 'Stage',
        selectStage: 'Select stage...',
        stagePrototype: 'Prototype',
        stagePreseries: 'Pre-series',
        stageProduction: 'Production',
        image: 'Image',
      },
      products: {
        title: 'Product Management',
        subtitle: 'Product and technology catalog',
        searchPlaceholder: 'Search by part number or customer...',
        viewGrid: 'Card view',
        viewTable: 'Table view',
        emptyState: 'No products registered.',
        goToCreate: 'Go to product management',
        filters: {
          allStatuses: 'All statuses',
          allCustomers: 'All customers',
        },
        step1: {
          title: 'General Data',
        },
        step2: {
          title: 'Specifications & Technologies',
        },
        actions: {
          create: 'New Product',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save Changes',
        },
        form: {
          partNumber: 'Part Number',
          partNumberRequired: 'Part number is required',
          customerPartNumber: 'Customer Part Number',
          description: 'Description',
          customer: 'Customer',
          technologies: 'Technologies',
          technologiesRequired: 'You must select at least one technology for the product.',
          status: 'Status',
          dimensions: 'Dimensions',
          dimensionsPlaceholder: 'e.g. 1540 x 280 x 62 mm',
          weight: 'Weight (kg)',
          weightPlaceholder: 'e.g. 2.65',
          cycleTime: 'Cycle Time (s)',
          cycleTimePlaceholder: 'e.g. 88',
          ratePerHour: 'Rate / Hour (pz/hr)',
          ratePerHourPlaceholder: 'e.g. 40',
          productFamily: 'Product Family',
          productionLine: 'Production Line',
        },
        toast: {
          createSuccess: 'Product created successfully',
          updateSuccess: 'Product updated successfully',
          deleteSuccess: 'Product deleted successfully',
        },
        detail: {
          masterData: 'Master Data',
          traceability: 'Traceability',
          technologies: 'Technologies',
          addTechnology: 'Add Technology',
          parameters: 'Parameters',
          specs: 'Dimensions & Specs',
          specsCards: {
            dimensions: 'DIMENSIONS',
            weight: 'WEIGHT (KG)',
            cycleTime: 'CYCLE TIME',
            ratePerHour: 'RATE / HOUR',
          }
        },
        deleteModal: {
          title: 'Delete this product?',
          message: 'The product "{{partNumber}}" will be deleted. This action cannot be undone.',
        },
        parameters: {
          title: 'Control Parameters Management',
          add: 'Add Parameter',
          requiresTechnology: 'You must define at least one technology to add parameters.',
          save: 'Save Changes',
          empty: 'No parameters defined for this product.',
          startAdding: 'Start adding parameters',
          saveSuccess: 'Parameters saved successfully',
          saveError: 'Error saving parameters',
          table: {
            name: 'Name',
            unit: 'Unit',
            min: 'Minimum',
            target: 'Target',
            max: 'Maximum',
            namePlaceholder: 'e.g. Temperature',
            critical: 'Critical',
            minPlaceholder: 'Min',
            targetPlaceholder: 'Tgt',
            maxPlaceholder: 'Max',
          }
        },
      },
      measurementUnits: {
        pageTitle: 'Measurement Units',
        subtitle: 'Catalog of measurement units for product parameters',
        newButton: 'New Unit',
        loading: 'Loading units...',
        noResults: 'No measurement units registered.',
        table: {
          description: 'DESCRIPTION',
          symbology: 'SYMBOL',
          magnitude: 'MAGNITUDE',
          actions: 'ACTIONS',
        },
        actions: {
          edit: 'Edit',
          delete: 'Delete',
        },
        form: {
          createTitle: 'New Measurement Unit',
          editTitle: 'Edit Unit',
          description: 'Description',
          descriptionPlaceholder: 'e.g. Kilogram',
          symbology: 'Symbol',
          symbologyPlaceholder: 'e.g. kg',
          magnitude: 'Magnitude',
          magnitudePlaceholder: 'e.g. Mass',
          cancel: 'Cancel',
          save: 'Save Unit',
          saving: 'Saving...',
        },
        confirmDelete: 'Are you sure you want to delete unit {{name}}?',
        toast: {
          createSuccess: 'Unit created successfully',
          createError: 'Error creating unit',
          updateSuccess: 'Unit updated successfully',
          updateError: 'Error updating unit',
          deleteSuccess: 'Unit deleted successfully',
          deleteError: 'Error deleting unit',
        }
      },
      locations: {
        pageTitle: 'Locations',
        subtitle: 'Manage physical locations and manufacturing areas.',
        newButton: 'New Location',
        loading: 'Loading locations...',
        noResults: 'No registered locations.',
        table: {
          code: 'CODE',
          name: 'NAME',
          type: 'TYPE',
          description: 'DESCRIPTION',
          actions: 'ACTIONS',
        },
        actions: {
          edit: 'Edit',
          delete: 'Delete',
        },
        form: {
          createTitle: 'New Location',
          editTitle: 'Edit Location',
          code: 'Code',
          codePlaceholder: 'e.g. L-01',
          type: 'Type',
          typePlaceholder: 'Line, Cell...',
          name: 'Location Name',
          namePlaceholder: 'Final Assembly Line',
          description: 'Description (Optional)',
          descriptionPlaceholder: 'Additional details about this location...',
          cancel: 'Cancel',
          save: 'Save Location',
          saving: 'Saving...',
        },
        confirmDelete: 'Are you sure you want to delete the location {{name}}?',
        toast: {
          createSuccess: 'Location created successfully',
          createError: 'Error creating location',
          updateSuccess: 'Location updated successfully',
          updateError: 'Error updating location',
          deleteSuccess: 'Location deleted successfully',
          deleteError: 'Error deleting location',
        },
      },

      // ─── RBAC ────────────────────────────────────
      rbac: {
        readOnlyMode: "Read-only mode. You don't have edit permissions.",
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
        responsibleDepartment: 'Responsible',
        operation: 'Operation / Technology',
        machinery: 'Machinery',
        location: 'Location',
        locationPlaceholder: 'Location...',
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
        auto_control: 'Auto Control',
        pokayoke: 'Poka-Yoke',
      },

      // ─── Departments ───────────────────────────
      departments: {
        Calidad: 'Quality',
        Producción: 'Production',
        Logística: 'Logistics',
        Materiales: 'Materials',
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
          // Predefined categories
          Inyección: 'Injection',
          Ensamble: 'Assembly',
          Torque: 'Torque',
          Soldadura: 'Welding',
          Estampado: 'Stamping',
          Pintura: 'Painting',
          Corte: 'Cutting',
          'Tratamiento Térmico': 'Heat Treatment',
          // Lowercase fallbacks
          inyección: 'Injection',
          ensamble: 'Assembly',
          torque: 'Torque',
          soldadura: 'Welding',
          estampado: 'Stamping',
          pintura: 'Painting',
          corte: 'Cutting',
          'tratamiento térmico': 'Heat Treatment',
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

      /* duplicate technologies
      technologies: {
        categories: {
          manageTitle: 'Manage Categories',
          list: 'Categories List',
          namePlaceholder: 'Category name...',
          empty: 'No categories found.',
          deleteConfirm: 'Are you sure you want to delete this category?',
          createSuccess: 'Category created successfully',
          createError: 'Error creating category',
          updateSuccess: 'Category updated successfully',
          updateError: 'Error updating category',
          deleteSuccess: 'Category deleted successfully',
          deleteError: 'Error deleting category'
        },
        pageTitle: 'Technologies',
        form: {
          createTitle: 'New Technology',
          editTitle: 'Edit Technology',
          name: 'Technology Name',
          category: 'Category',
          selectCategory: 'Select Category...',
          description: 'Description',
          parameters: 'Control Parameters',
          addParameter: 'Add Parameter',
          noParameters: 'No parameters defined for this technology.',
          paramName: 'Parameter Name',
          paramUnit: 'Unit',
          paramMin: 'Min',
          paramTarget: 'Target',
          paramMax: 'Max',
          paramCritical: 'Critical',
          cancel: 'Cancel',
          submit: 'Save Technology'
        },
        table: {
          allCategories: 'All Categories',
          search: 'Search...',
          id: 'ID',
          name: 'NAME',
          category: 'CATEGORY',
          parameters: 'PARAMETERS',
          createdBy: 'CREATED BY',
          updatedAt: 'UPDATED AT',
          actions: 'ACTIONS',
          empty: 'No technologies found.',
          expandTooltip: 'View details',
          statsTotalTechs: 'Total Technologies',
          statsSubTotal: 'registered',
          statsCriticalParams: 'Critical Params',
          statsSubCritical: 'across all tech',
          statsActiveCategories: 'Categories',
          statsSubCategories: 'in use'
        },
        toast: {
          createSuccess: 'Technology created successfully',
          createError: 'Error creating technology',
          updateSuccess: 'Technology updated successfully',
          updateError: 'Error updating technology',
          deleteSuccess: 'Technology deleted successfully',
          deleteError: 'Error deleting technology'
        }
      }, */

      machinery: {
        subtitle: 'Management of machinery used in operations (linked to Flowchart).',
        actions: {
          create: 'New Machinery'
        },
        modal: {
          createTitle: 'Register Machinery',
          editTitle: 'Edit Machinery'
        },
        form: {
          assetCode: 'Asset Code',
          assetCodePlaceholder: 'e.g. INJ-04',
          status: 'Status',
          statusActive: 'Active',
          statusInactive: 'Inactive',
          name: 'Machinery Name',
          namePlaceholder: 'e.g. 500T Injection Machine',
          plant: 'Plant',
          plantDefault: '1 - Default',
          location: 'Location (Optional)',
          locationSelect: '-- Select location --',
          cancel: 'Cancel',
          saving: 'Saving...',
          submitCreate: 'Create Machinery',
          submitUpdate: 'Update Machinery',
          errors: {
            codeRequired: 'Code is required',
            codeInvalid: 'Invalid format. Use letters, numbers, and dashes.',
            nameRequired: 'Name is required',
            plantRequired: 'Plant is required'
          }
        }
      },
      customers: {
        subtitle: 'Manage customer records and associated data.',
        actions: {
          create: 'New Customer'
        },
        safety: {
          title: 'Safety Characteristic',
          description: 'Mandatory symbol for project documentation headers (Diagrams, PFMEA, Control Plan).',
          required: 'You must select an option',
          options: {
            daimler: 'Safety / Daimler',
            critical: 'Safety-Critical',
            certification: 'Certification',
            vw: 'Mandatory Doc. / VW',
            legal: 'Legal / Environmental',
            ford: 'Safety Item / Ford'
          }
        }
      },

      // ─── Export ─────────────────────────────────
      export: {
        flowchart: {
          button: 'Export PDF',
          generating: 'Generating PDF...',
          title: 'PROCESS FLOW DIAGRAM',
          columns: {
            no: 'No.',
            description: 'Description',
            location: 'Locations',
            hic: 'HIC',
            quality: 'Quality',
            production: 'Production',
            logistics: 'Logistics',
            materials: 'Materials',
            others: 'Others',
            norm: 'Standard',
            machinery: 'Machinery',
          },
          header: {
            partNumber: 'Part number:',
            description: 'Description:',
            engineeringLevel: 'Engineering Level:',
            customer: 'Customer:',
            date: 'Date:',
            revision: 'Revision:',
          },
          summary: {
            storage: 'Storage',
            autoControl: 'Auto Control',
            delay: 'Delay',
            inspection: 'Inspection',
            operation: 'Operation',
            pokayoke: 'Pokayoke',
            transport: 'Transport',
            total: 'Total',
          },
          signatures: {
            prepared: 'Prepared by',
            approved: 'Approved by',
            reviewed: 'Reviewed by',
          },
          notes: {
            deviation: 'Note: If there is a deviation to the process flow, a deviation request must be submitted to the engineering department for approval and/or evaluation.',
            specialSymbols: 'Note: To use special symbols, see procedure PAC-06',
          },
          footer: {
            printDate: 'Print date:',
            revisionDate: 'Rev. date:',
          },
        },
        pfmea: {
          button: 'Export PFMEA',
          generating: 'Generating PFMEA...',
          title: 'PROCESS FAILURE MODE AND EFFECTS ANALYSIS (PFMEA)',
          header: {
            partNumber: 'Part number:',
            description: 'Description:',
            project: 'Project:',
            customer: 'Customer:',
            team: 'Team:',
            responsible: 'Process responsible:',
            pfmeaNumber: 'FMEA No.:',
            manufacturing: 'Manufacturing:',
            preparedBy: 'Prepared by:',
            originalDate: 'Original date:',
            revisionDate: 'Revision date:',
            stages: {
              prototype: 'Prototype',
              preLaunch: 'Pre-launch',
              production: 'Production',
            },
          },
          columns: {
            process: 'Process Item',
            operationNo: 'Op. No.',
            description: 'Description',
            workElement: 'Work Element',
            functionItem: 'Item Function',
            functionStep: 'Step Function',
            productChar: 'Product Char.',
            functionWorkElement: 'Work Element Function',
            processChar: 'Process Char.',
            failureMode: 'Failure Mode',
            failureEffect: 'Failure Effect (FE)',
            severityEF: 'FE (S)',
            failureCause: 'Failure Cause (FC)',
            occurrenceCF: 'FC (O)',
            preventionControl: 'Prevention Control FC',
            detectionControlMF: 'Detection Control FM',
            detectionControlCF: 'Detection Control FC',
            detectionMFCF: 'FM/FC (D)',
            ap: 'FMEA AP',
            hic: 'HIC',
            specialChar: 'Special Char.',
            preventionAction: 'Prevention Action',
            detectionAction: 'Detection Action',
            responsible: 'Responsible',
            targetDate: 'Target Date',
            status: 'Status',
            actionsTaken: 'Actions Taken',
            completionDate: 'Completion Date',
            newSeverity: 'Severity (S)',
            newOccurrence: 'Occurrence (O)',
            newDetection: 'Detection (D)',
            newAP: 'FMEA AP',
            observations: 'Notes',
          },
          signatures: {
            prepared: 'Prepared by',
            approved: 'Approved by',
            reviewed: 'Reviewed by',
          },
          footer: {
            printDate: 'Print date:',
            revisionDate: 'Rev. date:',
            page: 'Page',
          },
        },
      },
    },
  },
};

const savedLang = localStorage.getItem('i18nextLng') || 'es';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,            // Default language from local storage
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,  // React already escapes
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
