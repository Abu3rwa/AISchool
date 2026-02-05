import './Card.css';

const Card = ({
    children,
    className = '',
    hoverable = false,
    clickable = false,
    flat = false,
    outlined = false,
    glass = false,
    onClick,
    ...props
}) => {
    const classes = [
        'card',
        hoverable && 'card--hoverable',
        clickable && 'card--clickable',
        flat && 'card--flat',
        outlined && 'card--outlined',
        glass && 'card--glass',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, title, subtitle, actions, className = '' }) => (
    <div className={`card__header ${className}`}>
        <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
            {children}
        </div>
        {actions && <div className="card__actions">{actions}</div>}
    </div>
);

const CardBody = ({ children, compact = false, flush = false, className = '' }) => {
    const classes = [
        'card__body',
        compact && 'card__body--compact',
        flush && 'card__body--flush',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={classes}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => (
    <div className={`card__footer ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
