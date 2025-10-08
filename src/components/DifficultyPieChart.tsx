import React, {useMemo} from 'react';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Category, Difficulty, Question} from '../types/trivia';
import {decodeHtmlEntities, normalizeCategoryLabel} from '../utils/stringUtils';
import {DIFFICULTY_COLORS, EMPTY_COLORS} from '../colors';
import './DifficultyPieChart.css';

interface DifficultyPieChartProps {
    questions: Question[];
    categories: Category[];
    selectedCategoryId?: number;
}

export const DifficultyPieChart: React.FC<DifficultyPieChartProps> = ({
                                                                          questions,
                                                                          categories,
                                                                          selectedCategoryId,
                                                                      }) => {
    // Resolve selected category name (questions carry category by name)
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategoryId || selectedCategoryId === 0) return undefined;
        const found = categories.find(c => c.id === selectedCategoryId)?.name;
        return found ? decodeHtmlEntities(found) : undefined;
    }, [selectedCategoryId, categories]);

    // Filter questions based on selected category (if any)
    const filteredQuestions = useMemo(() => {
        if (!questions || questions.length === 0) return [] as Question[];
        if (!selectedCategoryName) return questions;
        const key = normalizeCategoryLabel(selectedCategoryName);
        return questions.filter(q => normalizeCategoryLabel(q.category) === key);
    }, [questions, selectedCategoryName]);

    // Aggregate difficulty counts
    const data = useMemo(() => {
        const counts: Record<Difficulty, number> = {
            [Difficulty.EASY]: 0,
            [Difficulty.MEDIUM]: 0,
            [Difficulty.HARD]: 0,
        };
        for (const q of filteredQuestions) {
            counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
        }
        return [
            {name: 'Easy', key: Difficulty.EASY, value: counts[Difficulty.EASY]},
            {name: 'Medium', key: Difficulty.MEDIUM, value: counts[Difficulty.MEDIUM]},
            {name: 'Hard', key: Difficulty.HARD, value: counts[Difficulty.HARD]},
        ];
    }, [filteredQuestions]);

    const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data]);

    // Instead of hiding the component when there are no questions,
    // render an "empty" donut so the panel stays visible and the layout is stable.
    const isEmpty = total === 0;

    // When empty, supply small placeholder values so Recharts will render slices,
    // but render them with low-opacity colors and overlay a centered "0 / No questions" label.
    const renderData = isEmpty ? data.map(d => ({...d, value: 1})) : data;

    const legendOrder = ['Easy', 'Medium', 'Hard'];

    const CustomLegend = ({payload}: any) => {
        const sortedPayload = [...payload].sort((a, b) => {
            const aIndex = legendOrder.indexOf(a.value);
            const bIndex = legendOrder.indexOf(b.value);
            return aIndex - bIndex;
        });
        return (
            <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
                {sortedPayload.map((entry, index) => (
                    <div key={index} style={{margin: '0 10px', display: 'flex', alignItems: 'center'}}>
                        <div style={{
                            width: 10,
                            height: 10,
                            backgroundColor: entry.color,
                            marginRight: 5,
                            borderRadius: '50%'
                        }}></div>
                        <span>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="stats-panel">
            <h3>Difficulty Distribution</h3>
            <div style={{width: '100%', height: 350, position: 'relative'}}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={renderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            animationBegin={0}
                            animationDuration={1000}
                            innerRadius={60}
                            outerRadius={100}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            label={({value}) => (!isEmpty && (value as number) > 0 ? `${value}` : null)}
                            labelLine={false}
                        >
                            {renderData.map((entry) => (
                                <Cell
                                    key={`diff-${entry.key}`}
                                    fill={isEmpty ? EMPTY_COLORS[entry.key] : DIFFICULTY_COLORS[entry.key]}
                                />
                            ))}
                        </Pie>
                        <Tooltip/>
                        {/* Put legend at the bottom to avoid creating horizontal overflow */}
                        <Legend content={<CustomLegend/>}/>
                    </PieChart>
                </ResponsiveContainer>

                {isEmpty && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: -20,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            color: 'var(--color-gray-dark)',
                        }}
                    >
                        <div style={{fontSize: 28, fontWeight: 600}}>0</div>
                        <div style={{fontSize: 12, opacity: 0.8}}>No questions</div>
                    </div>
                )}
            </div>
        </div>
    );
};
