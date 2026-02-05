import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import './Input.css';

const Input = forwardRef(({
    label,
    type = 'text',
    size = 'md',
    error,
    success = false,
    helper,
    required = false,
    disabled = false,
    iconLeft,
    iconRight,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    const inputClasses = [
        'input',
        size !== 'md' && `input--${size}`,
        iconLeft && 'input--with-icon-left',
        iconRight && 'input--with-icon-right',
        error && 'input--error',
        success && 'input--success',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={`input-wrapper ${containerClassName}`}>
            {label && (
                <label className={`input-label ${required ? 'input-label--required' : ''}`}>
                    {label}
                </label>
            )}

            <div className="input-container">
                {iconLeft && (
                    <span className="input-icon input-icon--left">{iconLeft}</span>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                    {...props}
                />

                {iconRight && (
                    <span className="input-icon input-icon--right">{iconRight}</span>
                )}
            </div>

            {error && (
                <span className="input-error">
                    <AlertCircle size={12} />
                    {error}
                </span>
            )}

            {helper && !error && (
                <span className="input-helper">{helper}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
