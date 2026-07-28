import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { FlowchartStep, SymbolType } from '../../types/flowchart.types';
import { FlowchartRow } from '../../components/flowcharts/FlowchartRow';

// Datos falsos iniciales
const initialSteps: FlowchartStep[] = [
  {
    id: 'step-1',
    sequence: 10,
    operationId: 'op-1',
    operationName: 'Recepción de Materia Prima',
    description: '',
    isCritical: false,
    symbolType: SymbolType.TRANSPORT,
    departmentId: 1,
    machineryIds: [],
    notes: '',
    responsibleDepartment: 'Logística',
  },
  {
    id: 'step-2',
    sequence: 20,
    operationId: 'op-2',
    operationName: 'Inspección de Calidad',
    description: '',
    isCritical: true,
    symbolType: SymbolType.INSPECTION,
    departmentId: 2,
    machineryIds: [],
    notes: '',
    responsibleDepartment: 'Calidad',
  },
];

const mockDepartments = [
  { id: 1, name: 'Logística', code: 'LOG', isActive: true },
  { id: 2, name: 'Calidad', code: 'QA', isActive: true },
  { id: 3, name: 'Producción', code: 'PROD', isActive: true },
];

const mockMachineries = [
  { id: 101, machineryName: 'Montacargas 1', machineryCode: 'MC-01', plantId: 1, isActive: true },
  { id: 102, machineryName: 'Mesa de Inspección', machineryCode: 'MI-01', plantId: 1, isActive: true },
  { id: 103, machineryName: 'Inyectora 500T', machineryCode: 'INJ-04', plantId: 1, isActive: true },
];

export const FlowchartWorkspace: React.FC = () => {
  const [steps, setSteps] = useState<FlowchartStep[]>(initialSteps);

  const handleUpdateStep = (id: string, field: keyof FlowchartStep, value: any) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newSteps = Array.from(steps);
    const [removed] = newSteps.splice(sourceIndex, 1);
    newSteps.splice(destinationIndex, 0, removed);

    // Recalcular secuencias (+10 para cada uno según su orden)
    const recalculatedSteps = newSteps.map((step, idx) => ({
      ...step,
      sequence: (idx + 1) * 10,
    }));

    setSteps(recalculatedSteps);
  };

  const addStep = () => {
    const newSequence = steps.length > 0 ? steps[steps.length - 1].sequence + 10 : 10;
    const newStep: FlowchartStep = {
      id: `step-${Date.now()}`,
      sequence: newSequence,
      operationId: '',
      operationName: 'Nueva Operación',
      description: '',
      isCritical: false,
      symbolType: SymbolType.OPERATION,
      departmentId: undefined,
      machineryIds: [],
      notes: '',
      responsibleDepartment: 'Producción',
    };
    setSteps([...steps, newStep]);
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Flowchart Workspace</h1>
          <button
            onClick={addStep}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
            data-testid="btn-add-step"
          >
            Agregar Paso
          </button>
        </div>

        <div className="bg-steel-900 border border-steel-800 rounded-xl shadow-xl overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-steel-950/50 text-steel-400 text-xs uppercase tracking-wider border-b border-steel-800">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3 w-16">Seq</th>
                  <th className="px-4 py-3 w-32">Símbolo</th>
                  <th className="px-4 py-3">Operación</th>
                  <th className="px-4 py-3 w-48">Departamento</th>
                  <th className="px-4 py-3 w-56">Maquinaria</th>
                  <th className="px-4 py-3 w-20 text-center">Crítico</th>
                </tr>
              </thead>
              <Droppable droppableId="flowchart-steps">
                {(provided) => (
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="divide-y divide-steel-800/50"
                  >
                    {steps.map((step, index) => (
                      <FlowchartRow
                        key={step.id}
                        index={index}
                        step={step}
                        onUpdate={handleUpdateStep}
                        departments={mockDepartments}
                        machineries={mockMachineries}
                      />
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};
