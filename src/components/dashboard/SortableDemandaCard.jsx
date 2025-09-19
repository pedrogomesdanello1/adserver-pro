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
      className="h-full"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing h-full"
      >
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
  );
};

export default SortableDemandaCard;
