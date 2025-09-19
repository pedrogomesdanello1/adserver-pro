import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DemandaCard from './DemandaCard';

const SortableDemandaCard = ({ demanda, criador, onStatusChange, onDelete, onSelect, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demanda.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full min-h-[400px]"
    >
      <div className="relative h-full">
        {/* Handle de drag - apenas uma pequena área */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 w-6 h-6 cursor-grab active:cursor-grabbing z-10 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="3" r="1"/>
            <circle cx="9" cy="3" r="1"/>
            <circle cx="3" cy="6" r="1"/>
            <circle cx="9" cy="6" r="1"/>
            <circle cx="3" cy="9" r="1"/>
            <circle cx="9" cy="9" r="1"/>
          </svg>
        </div>
        
        {/* Card principal - sem interferência do drag */}
        <div className="h-full">
          <DemandaCard
            demanda={demanda}
            criador={criador}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onSelect={onSelect}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default SortableDemandaCard;
