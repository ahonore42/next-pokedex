import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LoadingContextType {
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [isPageLoading, setPageLoading] = useState(false);
  const router = useRouter();

  // Handle route change loading states
  useEffect(() => {
    const handleRouteChangeStart = () => setPageLoading(true);
    const handleRouteChangeComplete = () => setPageLoading(false);
    const handleRouteChangeError = () => setPageLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  const value = {
    isGlobalLoading,
    setGlobalLoading,
    isPageLoading,
    setPageLoading,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Custom hook for page-level loading states
export const usePageLoading = (isLoading: boolean) => {
  const { setPageLoading } = useLoading();

  useEffect(() => {
    setPageLoading(isLoading);
    return () => setPageLoading(false);
  }, [isLoading, setPageLoading]);
};
