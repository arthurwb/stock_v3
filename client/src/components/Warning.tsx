import React, { ReactNode, useMemo, useState } from 'react';
import BorderedSection from './BorderedSection.tsx';

interface WarningProps {
    message: string;
    children?: ReactNode;
    className?: string;
    onClose: () => void;
}

const Warning: React.FC<WarningProps> = ({ message, children, className = "", onClose }) => {
    return (
        <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${className}`}>
            <BorderedSection label='warning' className='p-4 pt-8' border='border-red'>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white text-sm bg-transparent hover:text-red-400"
                    aria-label="Close warning"
                >
                    ×
                </button>
                <span className="text-white mt-6">{message}</span>
                {children}
            </BorderedSection>
        </div>
    );
};

export default Warning;