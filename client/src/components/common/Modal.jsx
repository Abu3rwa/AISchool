import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
}) => {
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose();
        }
    }, [onClose, closeOnEscape]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const modalClasses = [
        'gb-modal',
        `gb-modal--${size}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return createPortal(
        <div className="gb-modal-backdrop" onClick={handleBackdropClick}>
            <div className={modalClasses} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                {(title || showClose) && (
                    <div className="gb-modal__header">
                        {title && <h2 id="modal-title" className="gb-modal__title">{title}</h2>}
                        {showClose && (
                            <button className="gb-modal__close" onClick={onClose} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                <div className="gb-modal__body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ModalFooter = ({ children, split = false, className = '' }) => (
    <div className={`gb-modal__footer ${split ? 'gb-modal__footer--split' : ''} ${className}`}>
        {children}
    </div>
);

Modal.Footer = ModalFooter;

export default Modal;
