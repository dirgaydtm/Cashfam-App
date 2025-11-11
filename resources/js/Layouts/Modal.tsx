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

    if (!isOpen) return null;

    const sizeClasses = {
        small: "max-w-md",
        large: "max-w-4xl",
    };

    return (
        <div className="modal modal-open">
            <div
                ref={modalRef}
                className={`modal-box w-full ${sizeClasses[size]} max-h-[90vh]`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 id="modal-title" className="text-xl font-bold">
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
                <div className="">
                    {children}
                </div>
            </div>

            {/* Backdrop */}
            <div
                className="modal-backdrop"
                onClick={onClose}
            />
        </div>
    );
};

export default Modal;
