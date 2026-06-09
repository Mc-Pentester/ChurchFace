"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface RadioPlayerContextValue {
  radioId: string | null;
  isOpen: boolean;
  isMinimized: boolean;
  openRadio: (id: string) => void;
  closeRadio: () => void;
  toggleMinimize: () => void;
  setMinimized: (value: boolean) => void;
}

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const [radioId, setRadioId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openRadio = useCallback((id: string) => {
    setRadioId(id);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeRadio = useCallback(() => {
    setRadioId(null);
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((v) => !v);
  }, []);

  return (
    <RadioPlayerContext.Provider
      value={{
        radioId,
        isOpen,
        isMinimized,
        openRadio,
        closeRadio,
        toggleMinimize,
        setMinimized: setIsMinimized,
      }}
    >
      {children}
    </RadioPlayerContext.Provider>
  );
}

export function useRadioPlayer() {
  const ctx = useContext(RadioPlayerContext);
  if (!ctx) {
    throw new Error("useRadioPlayer must be used within RadioPlayerProvider");
  }
  return ctx;
}
