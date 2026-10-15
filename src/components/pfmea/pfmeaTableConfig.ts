/**
 * Configuración global compartida para las tablas de trabajo del PFMEA
 * (AIAG & VDA y AIAG Corporativo / APG).
 *
 * Cualquier parámetro definido aquí puede modificarse libremente y surtirá efecto
 * inmediato en ambas vistas de la aplicación.
 */
export const PFMEA_TABLE_CONFIG = {
  /** Ancho fijo en Tailwind para la primera columna de índice y acciones (#) */
  firstColumnWidth: 'w-[84px] min-w-[84px] max-w-[84px]',

  /** Ancho numérico en píxeles de la primera columna */
  firstColumnWidthPx: 84,

  /** Definición de columna para layouts CSS Grid (ej. AIAG & VDA) */
  firstColumnGridCol: '84px',

  /** Cantidad de filas por defecto para cada campo de entrada de texto modificado */
  defaultRows: 8,

  /** Cantidad de filas para campos apilados compactos (ej. Planta, Cliente, Usuario Final) */
  stackedRows: 3,

  /** Límite de caracteres máximo estándar para descripciones de proceso, causas, controles, etc. */
  defaultMaxLength: 500,

  /** Límite de caracteres para campos compactos */
  compactMaxLength: 250,

  /** Clase CSS para altura mínima de textareas estándar (8 filas) */
  minHeightClass: 'min-h-[140px]',

  /** Clase CSS para altura mínima de textareas apilados (3 filas) */
  stackedMinHeightClass: 'min-h-[60px]',
};

/** Alias de retrocompatibilidad */
export const PFMEA_TEXTAREA_CONFIG = PFMEA_TABLE_CONFIG;
