import { FC, ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
}

export const Tooltip: FC<TooltipProps> = ({ content, children }) => {
    return (
        <div className="group relative">
            {children}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#6A3B8F] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {content}
            </div>
        </div>
    );
}; 
