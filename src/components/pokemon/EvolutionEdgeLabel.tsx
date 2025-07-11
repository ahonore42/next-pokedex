import React from 'react';
import { EdgeProps, BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position } from '@xyflow/react';
import { useTheme } from '~/lib/contexts/ThemeContext';

const EvolutionEdgeLabel: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  sourcePosition,
  targetPosition,
}) => {
  const { theme } = useTheme();
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
            transform: `translate(-50%, -50%) translate(${hasManyDirectEvolutions ? targetX : centerX}px, ${hasManyDirectEvolutions ? centerY : targetY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`px-2 py-1 rounded-md shadow-md text-xs border w-24 text-center whitespace-normal break-words ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-indigo-100 text-gray-800 border-indigo-200'}`}
          >
            {(data?.label as string) || 'No Evolution'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default EvolutionEdgeLabel;
