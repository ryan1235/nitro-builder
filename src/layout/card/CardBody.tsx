import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { cls } from '../../api';

const classes = {
    base: 'flex flex-col p-4 w-full text-gray-700'
}

interface CardBodyProps
{
}

export const CardBody = forwardRef<HTMLDivElement, PropsWithChildren<CardBodyProps> & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>((props, ref) =>
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

CardBody.displayName = 'CardBody';
