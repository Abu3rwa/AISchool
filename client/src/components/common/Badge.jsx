import './Badge.css';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    outline = false,
    dot = false,
    className = '',
    ...props
}) => {
    const classes = [
        'badge',
        `badge--${variant}`,
        size !== 'md' && `badge--${size}`,
        outline && 'badge--outline',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes} {...props}>
            {dot && <span className="badge__dot" />}
            {children}
        </span>
    );
};

export default Badge;
