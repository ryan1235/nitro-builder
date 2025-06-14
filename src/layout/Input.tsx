import { DetailedHTMLProps, forwardRef, InputHTMLAttributes, PropsWithChildren } from 'react';
import { classNames } from './classNames';

const classes = {
    base: 'block w-full bg-white border border-gray-300 shadow-sm appearance-none transition-all duration-200',
    disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
    size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-2 text-sm',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base',
        xl: 'px-5 py-3 text-base',
    },
    rounded: 'rounded-lg',
    color: {
        default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400',
    }
}

export interface InputProps
{
    color?: 'default' | 'dark' | 'ghost';
    inputSize?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
    rounded?: boolean;
}

export const Input = forwardRef<HTMLInputElement, PropsWithChildren<InputProps> & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>((props, ref) =>
{
    const { color = 'default', inputSize = 'default', rounded = true, disabled = false, type = 'text', autoComplete = 'off', className = null, ...rest } = props;

    return (
        <input
            ref={ ref }
            disabled={ disabled }
            type={ type }
            autoComplete={ autoComplete }
            className={ classNames(
                classes.base,
                classes.size[inputSize],
                rounded && classes.rounded,
                classes.color[color],
                disabled && classes.disabled,
                className
            ) }
            { ...rest } />
    );
});

Input.displayName = 'Input';
