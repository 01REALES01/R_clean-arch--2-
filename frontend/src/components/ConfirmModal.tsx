import { X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Enter') {
            onConfirm();
        }
    };

    return (
        <div className="confirm-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-header">
                    <h3>{title}</h3>
                    <button className="confirm-close" onClick={onCancel} aria-label="Cerrar">
                        <X size={20} />
                    </button>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-actions">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        autoFocus
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn-confirm ${danger ? 'danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
