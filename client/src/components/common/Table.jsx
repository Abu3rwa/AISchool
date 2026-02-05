import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Spinner from './Spinner';
import './Table.css';

const Table = ({
    columns,
    data,
    loading = false,
    emptyTitle = 'No data found',
    emptyMessage = 'There are no items to display.',
    sortBy,
    sortOrder = 'asc',
    onSort,
    onRowClick,
    selectedRows = [],
    className = '',
}) => {
    const handleSort = (column) => {
        if (!column.sortable || !onSort) return;

        const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(column.key, newOrder);
    };

    const renderSortIcon = (column) => {
        if (!column.sortable) return null;

        if (sortBy !== column.key) {
            return <ChevronsUpDown size={14} className="table__sort-icon" />;
        }

        return sortOrder === 'asc'
            ? <ChevronUp size={14} className="table__sort-icon" />
            : <ChevronDown size={14} className="table__sort-icon" />;
    };

    return (
        <div className={`table-container ${className}`}>
            <table className="table">
                <thead className="table__header">
                    <tr className="table__header-row">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`table__header-cell ${column.sortable ? 'table__header-cell--sortable' : ''} ${sortBy === column.key ? 'table__header-cell--sorted' : ''}`}
                                style={{ width: column.width }}
                                onClick={() => handleSort(column)}
                            >
                                {column.header}
                                {renderSortIcon(column)}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="table__loading">
                                <Spinner size="lg" />
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="table__empty">
                                <Inbox size={48} className="table__empty-icon" />
                                <div className="table__empty-title">{emptyTitle}</div>
                                <div className="table__empty-message">{emptyMessage}</div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || row._id || rowIndex}
                                className={`table__body-row ${onRowClick ? 'table__body-row--clickable' : ''} ${selectedRows.includes(row.id || row._id) ? 'table__body-row--selected' : ''}`}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`table__cell ${column.align ? `table__cell--${column.align}` : ''}`}
                                    >
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const TablePagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="table-pagination">
            <span className="table-pagination__info">
                Showing {start} to {end} of {totalItems} results
            </span>

            <div className="table-pagination__controls">
                <button
                    className="table-pagination__btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="table-pagination__info">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className="table-pagination__btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

Table.Pagination = TablePagination;

export default Table;
