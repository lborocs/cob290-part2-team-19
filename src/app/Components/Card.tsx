import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    const cardStyles = {
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        backgroundColor: '#f3f4f6',
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        padding: '16px',
        boxShadow: '#c6c7c9 0px 0px 15px -5px',
        pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
    };

    return (
        <div style={cardStyles} className={className}>
            {children}
        </div>
    );
};

export default Card;