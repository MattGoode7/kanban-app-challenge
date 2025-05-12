import React from 'react';
import type { ReactNode } from 'react';
import { Droppable } from 'react-beautiful-dnd';

type DroppableAreaProps = {
  droppableId: string;
  children: ReactNode;
};

const DroppableArea: React.FC<DroppableAreaProps> = ({ droppableId, children }) => {
  return (
    <Droppable 
      droppableId={droppableId} 
      isDropDisabled={false} 
      isCombineEnabled={false}
      ignoreContainerClipping={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[100px] transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-white/5 rounded-lg' : ''
          }`}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableArea; 