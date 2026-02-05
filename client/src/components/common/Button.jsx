import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled = false,
    type = 'button',
    className = '',
    onClick,
    ...props
}) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        size !== 'md' && `btn--${size}`,
        iconOnly && 'btn--icon',
        fullWidth && 'btn--full',
        loading && 'btn--loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {icon && !iconOnly && <span className="btn__icon">{icon}</span>}
            {iconOnly ? icon : children}
        </button>
    );
};

export default Button;
