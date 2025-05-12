import React from 'react';
import { createPortal } from 'react-dom';

interface ModalConfirmProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-xl shadow-2xl p-8 w-full max-w-sm border border-white/20">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        {description && <p className="text-white/80 mb-6 text-sm">{description}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-gray-700 transition-colors border border-white/10"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-colors border border-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalConfirm; 