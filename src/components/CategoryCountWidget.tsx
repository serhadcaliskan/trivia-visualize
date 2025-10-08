import React, {useMemo} from 'react';
import {Category, Question} from '../types/trivia';
import {categoryNameKeys, decodeHtmlEntities, normalizeCategoryLabel} from '../utils/stringUtils';
import './CategoryCountWidget.css';

interface CategoryCountWidgetProps {
    selectedCategoryId?: number;
    categories: Category[];
    questions: Question[];
}

export const CategoryCountWidget: React.FC<CategoryCountWidgetProps> = ({
                                                                            selectedCategoryId,
                                                                            categories,
                                                                            questions,
                                                                        }) => {
    const label = useMemo(() => {
        if (!selectedCategoryId || selectedCategoryId === 0) return 'All Categories';
        const found = categories.find(c => c.id === selectedCategoryId);
        return found ? decodeHtmlEntities(found.name) : 'Selected Category';
    }, [selectedCategoryId, categories]);

    const count = useMemo(() => {
        if (!questions || questions.length === 0) return 0;
        if (!selectedCategoryId || selectedCategoryId === 0) return questions.length;

        const selected = categories.find(c => c.id === selectedCategoryId);
        if (!selected) return 0;

        const selectedKeys = new Set(categoryNameKeys(selected.name));
        return questions.reduce((acc, q) => acc + (selectedKeys.has(normalizeCategoryLabel(q.category)) ? 1 : 0), 0);
    }, [questions, selectedCategoryId, categories]);

    return (
        <div className="stats-panel">
            <h3>Question Availability</h3>
            <div className="category-count-widget">
                <div className="count-row">
                    <span className="count-number">{count.toLocaleString()}</span>
                    <span className="count-label">in {label}</span>
                </div>
            </div>
        </div>
    );
};
