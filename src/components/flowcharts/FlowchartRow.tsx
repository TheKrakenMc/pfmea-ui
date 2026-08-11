import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { FlowchartStep, SymbolType } from '../../types/flowchart.types';
import { ProcessSymbol } from './ProcessSymbols';

interface FlowchartRowProps {
  step: FlowchartStep;
  index: number;
  onUpdate: (id: string, field: keyof FlowchartStep, value: any) => void;
  // Catálogos simulados para los selectores
  departments: { id: number; name: string }[];
  machineries: { id: number; machineryName: string }[];
}

export const FlowchartRow: React.FC<FlowchartRowProps> = ({
  step,
  index,
  onUpdate,
  departments,
  machineries,
}) => {
  return (
    <Draggable draggableId={step.id} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-b border-steel-800 hover:bg-steel-800/50 transition-colors group ${
            snapshot.isDragging ? 'bg-steel-800 shadow-xl' : ''
          }`}
          data-testid={`row-${step.id}`}
        >
          {/* Drag Handle */}
          <td className="px-4 py-3 w-10">
            <div
              {...provided.dragHandleProps}
              className="text-steel-500 hover:text-white cursor-grab active:cursor-grabbing p-1 rounded"
              data-testid={`drag-handle-${step.id}`}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </td>

          {/* Sequence */}
          <td className="px-4 py-3 text-steel-400 font-mono text-sm w-16">
            {step.sequence}
          </td>

          {/* Symbol Selector */}
          <td className="px-4 py-3 w-32">
            <div className="relative flex items-center gap-2">
              <div className="text-white shrink-0">
                <ProcessSymbol symbolType={step.symbolType} size={18} />
              </div>
              <select
                value={step.symbolType}
                onChange={(e) => onUpdate(step.id, 'symbolType', e.target.value as SymbolType)}
                className="appearance-none bg-steel-950 border border-steel-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full"
                data-testid={`select-symbol-${step.id}`}
              >
                {['operation', 'inspection', 'transport', 'storage', 'delay', 'auto_control', 'pokayoke'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </td>

          {/* Operation (Text Input/Select mockup) */}
          <td className="px-4 py-3">
            <input
              type="text"
              value={step.description !== undefined ? step.description : step.operationName}
              onChange={(e) => onUpdate(step.id, 'description', e.target.value)}
              placeholder="Descripción de la Operación"
              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </td>

          {/* Department Selector */}
          <td className="px-4 py-3 w-48">
            <select
              value={step.departmentId || ''}
              onChange={(e) => onUpdate(step.id, 'departmentId', Number(e.target.value))}
              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              data-testid={`select-department-${step.id}`}
            >
              <option value="" disabled>Seleccionar Depto</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </td>

          {/* Machinery Selector (Multiple - simplified as a single select for MVP, or comma separated text) */}
          <td className="px-4 py-3 w-56">
            <select
              value={step.machineryIds[0] || ''}
              onChange={(e) => onUpdate(step.id, 'machineryIds', [Number(e.target.value)])}
              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              data-testid={`select-machinery-${step.id}`}
            >
              <option value="" disabled>Seleccionar Máquina</option>
              {machineries.map((mach) => (
                <option key={mach.id} value={mach.id}>
                  {mach.machineryName}
                </option>
              ))}
            </select>
          </td>

          {/* Critical Checkbox */}
          <td className="px-4 py-3 w-20 text-center">
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                checked={step.isCritical}
                onChange={(e) => onUpdate(step.id, 'isCritical', e.target.checked)}
                className="hidden"
                data-testid={`checkbox-critical-${step.id}`}
              />
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                  step.isCritical
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-steel-950 border-steel-700 text-steel-600 hover:border-steel-500'
                }`}
              >
                <span className="font-bold text-sm">@</span>
              </div>
            </label>
          </td>
        </tr>
      )}
    </Draggable>
  );
};
