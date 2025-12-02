
import React from 'react';

export type SelectionState = 'A' | 'B' | null;
export type ViewState = 'HOME' | 'CHAPTER_1' | 'CHAPTER_2' | 'CHAPTER_3' | 'CHAPTER_4' | 'DATA_GARDEN';
export type SectionState = 'INTRO' | 'DATA' | 'NARRATIVE' | 'MATTER';

export interface SceneProps {
  selection: SelectionState;
  view: ViewState;
  section: SectionState;
  onThornPrick: () => void;
}

export interface OverlayProps {
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  view: ViewState;
  setView: (view: ViewState) => void;
  section: SectionState;
  setSection: (section: SectionState) => void;
  setPanic: (state: boolean) => void;
}

// Add intrinsic element definition for model-viewer to fix TS errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        ar?: boolean;
        'shadow-intensity'?: string;
        exposure?: string;
        loading?: string;
        'touch-action'?: string; 
      }, HTMLElement>;
      // Allow any other elements (like R3F elements: mesh, group, etc.)
      [elemName: string]: any;
    }
  }
}
