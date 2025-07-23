import React from 'react';
import { EdgeProps, BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position } from '@xyflow/react';

export default function EvolutionEdgeLabel({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const hasManyDirectEvolutions = data?.hasManyDirectEvolutions as boolean;
  sourcePosition = hasManyDirectEvolutions ? Position.Bottom : sourcePosition;
  targetPosition = hasManyDirectEvolutions ? Position.Top : targetPosition;
  const [edgePath, centerX, centerY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) 
            translate(${hasManyDirectEvolutions ? targetX : centerX}px, ${hasManyDirectEvolutions ? centerY : targetY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`p-2 rounded-lg shadow-md text-xs border border-border 
            bg-surface w-28 text-center whitespace-normal leading-none break-words`}
          >
            {(data?.label as string) || 'No Evolution'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
