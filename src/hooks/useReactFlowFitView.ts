import { RefObject, useEffect } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';

export function useReactFlowFitView(
  instanceRef: RefObject<ReactFlowInstance | null>, // Ref holding the ReactFlow instance
  fitViewTrigger: unknown, // Any value that should trigger a re-fit
) {
  useEffect(() => {
    if (!instanceRef.current) return; // Skip if no instance yet

    // Run fitView 100 ms after fitViewTrigger change, 300ms for smooth transition on resizing
    const id = setTimeout(() => {
      instanceRef.current?.fitView({ duration: 300 }); 
    }, 100);

    return () => clearTimeout(id); // Cancel pending fit on unmount or fitViewTrigger change
  }, [instanceRef, fitViewTrigger]); // Re-run when ref or fitViewTrigger changes
}
