import React from 'react';
import type { SymbolType } from '../../types/flowchart.types';

interface ProcessSymbolProps extends React.SVGProps<SVGSVGElement> {
  symbolType: SymbolType;
  size?: number;
}

export const ProcessSymbol: React.FC<ProcessSymbolProps> = ({ symbolType, size = 16, className = '', ...props }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    ...props,
  };

  switch (symbolType) {
    case 'operation':
      // Círculo sólido (Operación)
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'inspection':
      // Cuadrado (Inspección)
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 15l2.5-2.5" strokeWidth="1.5" />
          <circle cx="13.5" cy="10.5" r="2.5" strokeWidth="1.5" />
        </svg>
      );
    case 'transport':
      // Flecha (Transporte)
      return (
        <svg {...commonProps}>
          <path d="M4 12h16" />
          <path d="M14 6l6 6-6 6" />
        </svg>
      );
    case 'storage':
      // Triángulo invertido (Almacenamiento)
      return (
        <svg {...commonProps}>
          <path d="M4 5h16L12 19 4 5z" />
        </svg>
      );
    case 'delay':
      // Forma de D (Demora)
      return (
        <svg {...commonProps}>
          <path d="M6 4v16h4c5.5 0 10-3.6 10-8s-4.5-8-10-8H6z" />
        </svg>
      );
    case 'auto_control':
      // Cuadrado con Círculo (Autocontrol)
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
    case 'pokayoke':
      // Escudo con check (Poka-Yoke)
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
};
