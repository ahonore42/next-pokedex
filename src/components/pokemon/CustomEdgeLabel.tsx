import React from 'react';
import { EdgeProps, BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { capitalizeName } from '~/utils/pokemon';

const CustomEdgeLabel: React.FC<EdgeProps> = ({
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
  const [edgePath, centerX] = getSmoothStepPath({
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
            transform: `translate(-50%, -50%) translate(${centerX}px, ${targetY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`px-2 py-1 rounded-md shadow-md text-xs border w-24 text-center whitespace-normal break-words ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {capitalizeName(data?.label as string) || 'No Evolution'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeLabel;
