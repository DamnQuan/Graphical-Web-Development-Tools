import { create } from 'zustand';

interface UILayoutStore {
  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  bottomPanelCollapsed: boolean;
  leftActiveTab: 'files' | 'components';
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setLeftActiveTab: (tab: 'files' | 'components') => void;
  resetLayout: () => void;
}

export const useUILayoutStore = create<UILayoutStore>((set) => ({
  leftPanelWidth: 260,
  rightPanelWidth: 300,
  bottomPanelHeight: 0,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  bottomPanelCollapsed: true,
  leftActiveTab: 'files',

  setLeftPanelWidth: (width) => set({ leftPanelWidth: Math.max(150, Math.min(500, width)) }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: Math.max(200, Math.min(500, width)) }),
  setBottomPanelHeight: (height) => set({ bottomPanelHeight: Math.max(100, height) }),

  toggleLeftPanel: () =>
    set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
  toggleBottomPanel: () =>
    set((state) => ({ bottomPanelCollapsed: !state.bottomPanelCollapsed })),

  setLeftActiveTab: (tab) => set({ leftActiveTab: tab }),

  resetLayout: () =>
    set({
      leftPanelWidth: 260,
      rightPanelWidth: 300,
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,
    }),
}));
