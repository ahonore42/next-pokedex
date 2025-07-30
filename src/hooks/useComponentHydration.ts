import { useState, useEffect, useCallback, useRef } from 'react';

export function useComponentHydration(dataLength: number, datasetId?: string | number) {
  const [loadedData, setLoadedData] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevDatasetId = useRef(datasetId);

  // Handle data loading with bounds checking
  const handleDataLoad = useCallback(() => {
    setLoadedData((prev) => Math.min(prev + 1, totalData));
  }, [totalData]);

  // Update total data when dataLength changes
  useEffect(() => {
    const newTotal = dataLength || 0;
    setTotalData(newTotal);
  }, [dataLength]);

  // Reset when dataset changes (new list ID)
  useEffect(() => {
    if (datasetId !== prevDatasetId.current) {
      setLoadedData(0);
      setTotalData(dataLength || 0);
      prevDatasetId.current = datasetId;
    }
  }, [datasetId, dataLength]);

  const allDataLoaded = totalData > 0 && loadedData === totalData;
  const loadProgress = totalData > 0 ? (loadedData / totalData) * 100 : 0;

  return {
    handleDataLoad,
    containerRef,
    loadProgress,
    loadedData,
    totalData,
    allDataLoaded,
  };
}
