import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { cls } from '../../api';

const classes = {
    base: 'flex justify-center bg-gray-50 border-b border-gray-200 py-3 px-4 select-none items-center overflow-hidden'
}

interface CardHeaderProps
{
}

export const CardHeader = forwardRef<HTMLDivElement, PropsWithChildren<CardHeaderProps> & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>((props, ref) =>
{
    const { className = '', ...rest } = props;

    return (
        <div
            ref={ ref }
            className={ cls(`
                ${ classes.base }
                ${ className }`)
            }
            { ...rest } />
    );
});

CardHeader.displayName = 'CardHeader';
