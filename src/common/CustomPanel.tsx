import React from "react";
import { X } from "lucide-react"

interface CustomPanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  saveLabel?: string;
  width?: string;
  hideCancel?: boolean;
  hideSave?: boolean;
}

const CustomPanel: React.FC<CustomPanelProps> = ({
  isOpen,
  title,
  onClose,
  onSave,
  children,
  saveLabel = "Save",
  width = "560px",
  hideCancel = false,
  hideSave = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      {/* Backdrop click closes panel */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Panel Content */}
      <div 
        className="bg-background h-full shadow-xl flex flex-col overflow-hidden border-l border-border"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-4 px-6 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-foreground">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0 bg-muted/50">
          {!hideCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          {!hideSave && (
            <button
              onClick={onSave || onClose}
              className="px-4 py-2 text-sm text-primary-foreground rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPanel;