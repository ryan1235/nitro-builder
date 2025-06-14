import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { classNames } from './classNames';

const classes = {
    base: 'inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
}

interface BadgeProps
{
}

export const Badge = forwardRef<HTMLSpanElement, PropsWithChildren<BadgeProps> & DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>((props, ref) =>
{
    const { className = null, ...rest } = props;

    return (
        <span
            ref={ ref }
            className={ classNames(
                classes.base,
                className
            ) }
            { ...rest } />
    );
});

Badge.displayName = 'Badge';
