import React, {useMemo} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Category, Question, QuestionType} from '../types/trivia';
import {decodeHtmlEntities, normalizeCategoryLabel} from '../utils/stringUtils';
import {TYPE_COLORS} from '../colors';
import './TypeBarChart.css';

interface TypeBarChartProps {
    questions: Question[];
    categories: Category[];
    selectedCategoryId?: number;
}

export const TypeBarChart: React.FC<TypeBarChartProps> = ({
                                                              questions,
                                                              categories,
                                                              selectedCategoryId,
                                                          }) => {
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategoryId || selectedCategoryId === 0) return undefined;
        const found = categories.find(c => c.id === selectedCategoryId)?.name;
        return found ? decodeHtmlEntities(found) : undefined;
    }, [selectedCategoryId, categories]);

    const filteredQuestions = useMemo(() => {
        if (!questions || questions.length === 0) return [] as Question[];
        if (!selectedCategoryName) return questions;
        const key = normalizeCategoryLabel(selectedCategoryName);
        return questions.filter(q => normalizeCategoryLabel(q.category) === key);
    }, [questions, selectedCategoryName]);

    const counts = useMemo(() => {
        let multiple = 0;
        let booleanT = 0;
        for (const q of filteredQuestions) {
            if (q.type === QuestionType.MULTIPLE) multiple += 1;
            else if (q.type === QuestionType.BOOLEAN) booleanT += 1;
        }
        return {multiple, boolean: booleanT};
    }, [filteredQuestions]);

    const data = useMemo(
        () => [
            {key: QuestionType.MULTIPLE, name: 'Multiple Choice', value: counts.multiple},
            {key: QuestionType.BOOLEAN, name: 'True / False', value: counts.boolean},
        ],
        [counts]
    );

    const total = counts.multiple + counts.boolean;

    return (
        <div className="stats-panel">
            <h3>Question Types</h3>
            <div style={{width: '100%', height: 222}}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{top: 10, right: 10, left: 0, bottom: 10}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name" interval={0} tick={{fontSize: 12}}/>
                        <YAxis allowDecimals={false}/>
                        <Tooltip/>
                        <Bar dataKey="value"
                             radius={[4, 4, 0, 0]}
                             animationBegin={0}
                             animationDuration={1000}>
                            {data.map((entry) => (
                                <Cell key={`cell-${entry.key}`} fill={TYPE_COLORS[entry.key]}/>
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                {total === 0 && (
                    <div style={{textAlign: 'center', color: 'var(--color-gray-dark)', fontSize: 12, marginTop: -2}}>
                        No questions available
                    </div>
                )}
            </div>
        </div>
    );
};
