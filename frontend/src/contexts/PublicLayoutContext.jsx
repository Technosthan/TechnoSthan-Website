import { createContext, useContext } from "react";

const PublicLayoutContext = createContext(false);

export const PublicLayoutProvider = PublicLayoutContext.Provider;

export const usePublicLayout = () => useContext(PublicLayoutContext);

export default PublicLayoutContext;
