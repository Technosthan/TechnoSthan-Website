/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import useReducedMotion from "../lib/useReducedMotion";

const AppMotionContext = createContext(null);

export const AppMotionProvider = ({ children }) => {
  const reducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(!reducedMotion);
  const [isAppReady, setIsAppReady] = useState(reducedMotion);

  const value = useMemo(
    () => ({
      isLoading,
      isAppReady,
      reducedMotion,
      setLoading: (nextLoading) => setIsLoading(Boolean(nextLoading)),
      setAppReady: (nextReady = true) => setIsAppReady(Boolean(nextReady)),
      completeAppMotion: () => {
        setIsLoading(false);
        setIsAppReady(true);
      },
    }),
    [isLoading, isAppReady, reducedMotion]
  );

  return (
    <AppMotionContext.Provider value={value}>
      {children}
    </AppMotionContext.Provider>
  );
};

export const useAppMotion = () => {
  const context = useContext(AppMotionContext);

  if (!context) {
    throw new Error("useAppMotion must be used within AppMotionProvider");
  }

  return context;
};

export default AppMotionProvider;
