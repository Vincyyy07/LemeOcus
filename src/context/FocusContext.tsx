import { createContext, useContext, useState, ReactNode } from "react";

export type FocusSession = {
  taskId: string;
  taskTitle: string;
  duration: number; // seconds
  isActive: boolean;
};

type FocusContextType = {
  focusSession: FocusSession | null;
  startFocus: (task: { id: string; title: string }, durationSeconds?: number) => void;
  endFocus: () => void;
};

const FocusContext = createContext<FocusContextType | null>(null);

export const FocusProvider = ({ children }: { children: ReactNode }) => {
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);

  const startFocus = (task: { id: string; title: string }, durationSeconds = 25 * 60) => {
    setFocusSession({
      taskId: task.id,
      taskTitle: task.title,
      duration: durationSeconds,
      isActive: true,
    });
  };

  const endFocus = () => setFocusSession(null);

  return (
    <FocusContext.Provider value={{ focusSession, startFocus, endFocus }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used inside FocusProvider");
  return ctx;
};
