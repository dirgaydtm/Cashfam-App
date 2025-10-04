import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | React.ReactNode;
    children: React.ReactNode;
    size?: "small" | "large";
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = "small",
    showCloseButton = true,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        small: "max-w-md",
        large: "max-w-4xl",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-base-100 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <h2 id="modal-title" className="text-xl font-semibold">
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-circle"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
