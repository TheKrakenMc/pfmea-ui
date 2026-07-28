import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowchartWorkspace } from '../pages/flowcharts/FlowchartWorkspace';
import { SymbolType } from '../types/flowchart.types';

describe('FlowchartWorkspace', () => {
  test('Test 1 (Data Validation): Updates local state correctly on department and machinery change', async () => {
    render(<FlowchartWorkspace />);
    
    // Obtenemos los selectores del primer paso (step-1)
    const deptSelect = screen.getByTestId('select-department-step-1');
    const machSelect = screen.getByTestId('select-machinery-step-1');
    const criticalCheckbox = screen.getByTestId('checkbox-critical-step-1');
    
    // Cambiamos Departamento (de 1 a 2)
    fireEvent.change(deptSelect, { target: { value: '2' } });
    expect((deptSelect as HTMLSelectElement).value).toBe('2');
    
    // Cambiamos Maquinaria (de vacio a 101)
    fireEvent.change(machSelect, { target: { value: '101' } });
    expect((machSelect as HTMLSelectElement).value).toBe('101');
    
    // Cambiamos Checkbox Critico
    fireEvent.click(criticalCheckbox);
    expect((criticalCheckbox as HTMLInputElement).checked).toBe(true);
  });

  test('Test 2 (Symbol Toggle): Expands all symbol options and updates state on selection', async () => {
    render(<FlowchartWorkspace />);
    
    const symbolSelect = screen.getByTestId('select-symbol-step-1') as HTMLSelectElement;
    
    // Verificar que las opciones del Enum existan en el DOM
    const options = Array.from(symbolSelect.options).map(opt => opt.value);
    expect(options).toContain(SymbolType.OPERATION);
    expect(options).toContain(SymbolType.INSPECTION);
    expect(options).toContain(SymbolType.TRANSPORT);
    expect(options).toContain(SymbolType.STORAGE);
    expect(options).toContain(SymbolType.DELAY);
    expect(options).toContain(SymbolType.AUTO_CONTROL);
    expect(options).toContain(SymbolType.POKAYOKE);
    
    // Seleccionar otra opción
    fireEvent.change(symbolSelect, { target: { value: SymbolType.INSPECTION } });
    expect(symbolSelect.value).toBe(SymbolType.INSPECTION);
  });

  test('Test 3 (Calculated Sequence): Auto increments sequence number when adding a new step', async () => {
    render(<FlowchartWorkspace />);
    
    // Inicialmente tenemos 2 pasos (10 y 20)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.queryByText('30')).not.toBeInTheDocument();
    
    // Agregamos un paso
    const addButton = screen.getByTestId('btn-add-step');
    fireEvent.click(addButton);
    
    // Esperamos que se renderice el nuevo paso con la secuencia 30
    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });
});
