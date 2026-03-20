function ItemList({ items, onDelete }) {
    if (items.length === 0) {
        return (
            <div className="item-list__empty">
                <div className="item-list__empty-icon">📋</div>
                <p className="item-list__empty-text">No items yet</p>
                <p className="item-list__empty-sub">Create your first item above to get started</p>
            </div>
        );
    }

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="item-list">
            {items.map((item, index) => (
                <div
                    className="item-card"
                    key={item.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className="item-card__header">
                        <div>
                            <h3 className="item-card__title">{item.title}</h3>
                            {item.description && (
                                <p className="item-card__description">{item.description}</p>
                            )}
                        </div>
                        <button
                            className="btn btn--danger"
                            onClick={() => onDelete(item.id)}
                            title="Delete item"
                            id={`delete-item-${item.id}`}
                        >
                            ✕ Delete
                        </button>
                    </div>
                    <div className="item-card__meta">
                        <span>🕒</span>
                        <span>{formatDate(item.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ItemList;
