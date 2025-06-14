import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef, PropsWithChildren } from 'react';
import { classNames } from './classNames';

const classes = {
    base: 'inline-flex justify-center items-center gap-2 transition-all duration-200 transform tracking-wide rounded-lg shadow-sm hover:shadow-md active:scale-95',
    disabled: 'opacity-50 cursor-not-allowed',
    size: {
        xs: 'px-2 py-1 text-xs font-medium',
        sm: 'px-3 py-2 text-sm font-medium',
        default: 'px-4 py-2 text-sm font-medium',
        lg: 'px-6 py-3 text-base font-medium',
        xl: 'px-8 py-4 text-lg font-medium',
    },
    outline: {
        default: 'text-blue-600 hover:text-white border-2 border-blue-600 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        dark: 'text-gray-700 hover:text-white border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    },
    color: {
        default: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        dark: 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:bg-gray-200'
    }
}

interface ButtonProps
{
    color?: 'default' | 'dark' | 'ghost';
    size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
    outline?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps> & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>>((props, ref) =>
{
    const { color = 'default', size = 'default', outline = false, disabled = false, type = 'button', className = null, ...rest } = props;

    return (
        <button
            ref={ ref }
            disabled={ disabled }
            type={ type }
            className={ classNames(
                classes.base,
                classes.size[size],
                outline ? classes.outline[color] : classes.color[color],
                disabled && classes.disabled,
                className
            ) }
            { ...rest } />
    );
});

Button.displayName = 'Button';
