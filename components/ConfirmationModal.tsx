import React, { useEffect, useRef } from 'react';
import { AlertTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Set focus to the modal container for accessibility
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md m-4 bg-brand-surface border border-brand-border rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        tabIndex={-1} // Make div focusable
      >
        <div className="flex flex-col p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:h-10 sm:w-10">
              <AlertTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-4 text-left">
              <h3 id="modal-title" className="text-lg font-semibold leading-6 text-brand-text-primary">
                {title}
              </h3>
            </div>
          </div>

          <div className="mb-6 pl-16">
            <p className="text-sm text-brand-text-secondary">
              {children}
            </p>
          </div>
          
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-4">
             <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-brand-border px-4 py-2 bg-brand-surface text-base font-medium text-brand-text-primary shadow-sm hover:bg-brand-border/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-bg transition-colors sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-brand-bg transition-colors sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
