import React, { createContext, useContext } from 'react';

// Lets deep screens leave the current game mode and return to the main menu.
const ExitContext = createContext<() => void>(() => {});

export function ExitProvider({ onExit, children }: { onExit: () => void; children: React.ReactNode }) {
  return <ExitContext.Provider value={onExit}>{children}</ExitContext.Provider>;
}

export function useExit(): () => void {
  return useContext(ExitContext);
}
