import './Spinner.css';

const Spinner = ({
    size = 'md',
    color = 'primary',
    className = '',
}) => {
    const classes = [
        'spinner',
        `spinner--${size}`,
        color !== 'primary' && `spinner--${color}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} role="status" aria-label="Loading">
            <div className="spinner__circle" />
        </div>
    );
};

export const SpinnerOverlay = ({ text = 'Loading...', size = 'lg' }) => (
    <div className="spinner-overlay">
        <div className="spinner-container">
            <Spinner size={size} />
            {text && <span className="spinner-text">{text}</span>}
        </div>
    </div>
);

export default Spinner;
