import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { cls } from '../../api';

const classes = {
    base: 'flex flex-col bg-white shadow-lg rounded-xl w-full overflow-hidden'
}

interface CardProps
{
}

export const Card = forwardRef<HTMLDivElement, PropsWithChildren<CardProps> & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>((props, ref) =>
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

Card.displayName = 'Card';
