import React, {useId} from "react";
import {Category} from "../types/trivia";
import './CategoriesCard.css';

interface CategoriesCardProps {
    categories: Category[];
    onCategorySelect: (category: Category) => void;
    selectedCategoryId?: number;
    isOpen: boolean;
    onToggle: () => void;
}

export const CategoriesCard: React.FC<CategoriesCardProps> = ({
                                                                  categories,
                                                                  onCategorySelect,
                                                                  selectedCategoryId = 0,
                                                                  isOpen,
                                                                  onToggle
                                                              }) => {
    const anyCategory = {id: 0, name: "Any Category"};
    const contentId = useId();
    const panelId = `categories-panel-${contentId}`;

    return <div className={`categories-container ${isOpen ? 'open' : 'collapsed'}`}>
        <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={isOpen ? 'Collapse categories' : 'Expand categories'}
            title={isOpen ? 'Collapse categories' : 'Expand categories'}
            aria-expanded={isOpen}
            aria-controls={panelId}
        >
            <span className="sidebar-toggle-icon" aria-hidden="true">{isOpen ? '⟨' : '⟩'}</span>
        </button>
        {isOpen && <div className="categories-header" id={`${panelId}-header`}>

            <h3>Categories</h3>

        </div>}
        {isOpen && (
            <div className="categories-list" id={panelId}>
                <button
                    key={anyCategory.id}
                    type="button"
                    title={anyCategory.name}
                    aria-label={anyCategory.name}
                    className={`category-button ${selectedCategoryId === anyCategory.id ? 'selected' : ''}`}
                    onClick={() => onCategorySelect(anyCategory)}>
                    <span className="category-label">{anyCategory.name}</span>
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        type="button"
                        title={category.name}
                        aria-label={category.name}
                        className={`category-button ${selectedCategoryId === category.id ? 'selected' : ''}`}
                        onClick={() => onCategorySelect(category)}>
                        <span className="category-label">{category.name}</span>
                    </button>
                ))}
            </div>
        )}
    </div>
}