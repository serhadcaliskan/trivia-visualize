import React, {useCallback, useMemo} from 'react';
import {ResponsiveContainer, Tooltip, Treemap} from 'recharts';
import {Category, Question} from '../types/trivia';
import {categoryNameKeys, decodeHtmlEntities, normalizeCategoryLabel} from '../utils/stringUtils';
import {DEFAULT_COLORS} from '../colors';
import './ThemeTreemap.css';

interface ThemeTreemapProps {
    questions: Question[];
    categories: Category[];
    onCategorySelect: (category: Category) => void;
    selectedCategoryId?: number;
}

export const ThemeTreemap: React.FC<ThemeTreemapProps> = ({
                                                              questions,
                                                              categories,
                                                              onCategorySelect,
                                                              selectedCategoryId
                                                          }) => {
    // Create mapping from normalized category names to category objects
    const categoryNameToCategory = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach(category => {
            for (const key of categoryNameKeys(category.name)) {
                map.set(key, category);
            }
        });
        return map;
    }, [categories]);

    const data = useMemo(() => {
        // Accumulate counts per normalized key, but preserve a readable display name
        const byKey = new Map<string, { name: string; size: number }>();
        for (const q of questions) {
            const displayName = decodeHtmlEntities(q.category) || 'Unknown';
            const key = normalizeCategoryLabel(q.category || 'Unknown');
            const prev = byKey.get(key) || {name: displayName, size: 0};
            prev.size += 1;
            if (!byKey.has(key)) byKey.set(key, prev);
        }
        // Attach categoryId when we can resolve it by normalized key
        return Array.from(byKey.entries()).map(([key, {name, size}]) => {
            const category = categoryNameToCategory.get(key);
            return {name, size, categoryId: category?.id} as { name: string; size: number; categoryId?: number };
        });
    }, [questions, categoryNameToCategory]);

    // Get the selected category name based on selectedCategoryId (for label equality fallback)
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategoryId) return null;
        const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
        return selectedCategory ? decodeHtmlEntities(selectedCategory.name) : null;
    }, [selectedCategoryId, categories]);

    // Custom content to color nodes consistently and show labels
    const renderContent = useCallback((props: any) => {
        const {x, y, width, height, index, name, payload} = props;
        const fill = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const isSelectedById = typeof selectedCategoryId === 'number' && payload?.categoryId === selectedCategoryId;
        const isSelectedByName = selectedCategoryName ? normalizeCategoryLabel(selectedCategoryName) === normalizeCategoryLabel(String(name ?? '')) : false;
        const isSelected = isSelectedById || isSelectedByName;
        const isDimmed = ((selectedCategoryId != null && selectedCategoryId !== 0) || selectedCategoryName != null) && !isSelected;

        // Padding inside each node
        const horizontalPadding = 6;
        const verticalPadding = 6;
        const fontSize = 12;
        const lineHeight = 14; // px

        // Rough text width estimator (bold-ish 12px -> ~7px per char average)
        const estimateTextWidth = (text: string) => Math.ceil(text.length * 7);

        const wrapText = (text: string, maxWidth: number, maxLines: number): string[] => {
            if (maxWidth <= 0 || maxLines <= 0) return [];
            const words = text.split(' ');
            const lines: string[] = [];
            let current = '';
            for (const word of words) {
                const next = current ? current + ' ' + word : word;
                if (estimateTextWidth(next) <= maxWidth) {
                    current = next;
                } else {
                    if (current) lines.push(current);
                    current = word;
                    if (lines.length >= maxLines - 1) break;
                }
            }
            if (lines.length < maxLines && current) {
                lines.push(current);
            }
            // Ellipsize last line if still too wide
            if (lines.length > 0 && estimateTextWidth(lines[lines.length - 1]) > maxWidth) {
                let last = lines[lines.length - 1];
                while (last && estimateTextWidth(last + '\u2026') > maxWidth) {
                    last = last.slice(0, -1);
                }
                lines[lines.length - 1] = last ? last + '\u2026' : '\u2026';
            }
            return lines;
        };

        const availableWidth = Math.max(0, width - horizontalPadding * 2);
        const availableHeight = Math.max(0, height - verticalPadding * 2);
        const maxLines = Math.floor(availableHeight / lineHeight);
        const lines = wrapText(String(name ?? ''), availableWidth, maxLines);

        const handleClick = () => {
            // Prefer stable id carried in payload
            const categoryId: number | undefined = payload?.categoryId;
            if (typeof categoryId === 'number') {
                const category = categories.find(c => c.id === categoryId);
                if (category) {
                    onCategorySelect(category);
                    return;
                }
            }
            // Fallback to normalized name lookup
            const category = categoryNameToCategory.get(normalizeCategoryLabel(name));
            if (category) {
                onCategorySelect(category);
            } else {
                // Handle "Unknown" category case
                const unknownCategory = {id: 0, name: 'Unknown'};
                onCategorySelect(unknownCategory);
            }
        };

        return (
            <g
                style={{opacity: isDimmed ? 0.35 : 1}}
                onClick={handleClick}
            >
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{fill, stroke: '#fff', strokeWidth: 2, cursor: 'pointer'}}
                />
                {availableWidth > 30 && availableHeight > lineHeight && lines.length > 0 && (
                    <text
                        x={x + horizontalPadding}
                        y={y + verticalPadding + fontSize}
                        fill="#fff"
                        fontSize={fontSize}
                        fontWeight={600}
                        pointerEvents="none"
                    >
                        {lines.map((line: string, i: number) => (
                            <tspan key={i} x={x + horizontalPadding} dy={i === 0 ? 0 : lineHeight}>
                                {line}
                            </tspan>
                        ))}
                    </text>
                )}
            </g>
        );
    }, [selectedCategoryName, selectedCategoryId, categoryNameToCategory, onCategorySelect, categories]);

    const isEmpty = !questions || questions.length === 0;

    return (
        <div className="stats-panel">
            <h3>Theme Distribution</h3>
            <div style={{width: '100%', height: 250, position: 'relative'}}>
                {isEmpty ? (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-gray-dark)',
                        }}
                    >
                        <span style={{fontSize: 12, opacity: 0.8, color: 'var(--color-gray-dark)'}}>No questions</span>
                    </div>
                ) : (
                    <ResponsiveContainer>
                        <Treemap data={data} dataKey="size" stroke="#fff" content={renderContent}
                                 isAnimationActive={false}>
                            <Tooltip/>
                        </Treemap>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
