import React, {useCallback, useEffect, useState} from 'react';
import {useTriviaApi} from '../hooks/useTriviaApi';
import {Category, Difficulty, QuestionType} from '../types/trivia';
import {ThemeTreemap} from './ThemeTreemap';
import {CategoriesCard} from "./CategoriesCard";
import {CategoryCountWidget} from './CategoryCountWidget';
import {DifficultyPieChart} from './DifficultyPieChart';
import {TypeBarChart} from './TypeBarChart';
import './TriviaApp.css';

interface Settings {
    amount: number;
    category?: number;
    difficulty?: Difficulty;
    type?: QuestionType;
}

export const TriviaApp: React.FC = () => {
    const {
        questions,
        categories,
        isLoading,
        error,
        hasToken,
        requestToken,
        getQuestions,
        getCategories,
        clearError,
    } = useTriviaApi();

    const [settings, setSettings] = useState<Settings>({
        amount: 50,
        category: undefined,
        difficulty: undefined,
        type: undefined,
    });

    const [isOpen, setIsOpen] = useState(true);

    const handleCategorySelect = (category: Category) => {
        setSettings(prev => ({...prev, category: category.id}));
    };

    const sidebarWidth = isOpen ? 260 : 50;

    // Load categories on component mount
    useEffect(() => {
        getCategories();
    }, [getCategories]);

    // Auto-request token if we don't have one
    useEffect(() => {
        if (!hasToken && !isLoading) {
            requestToken();
        }
    }, [hasToken, isLoading, requestToken]);

    const handleGetQuestions = useCallback(async () => {
        await getQuestions(
            settings.amount,
            settings.category,
            settings.difficulty,
            settings.type
        );
    }, [getQuestions, settings.amount, settings.category, settings.difficulty, settings.type]);

    // Auto-fetch 50 questions when the app opens (after we have a token)
    useEffect(() => {
        if (hasToken && !isLoading && questions.length === 0) {
            handleGetQuestions();
        }
    }, [hasToken, isLoading, questions.length, handleGetQuestions]);

    return (
        <div className="trivia-app">
            <header className="fixed-header" style={{left: sidebarWidth}}>
                <h1>Open Trivia DB API Overview</h1>
            </header>

            <div className="app-layout">
                <aside className="sidebar" style={{width: sidebarWidth}}>
                    <CategoriesCard
                        categories={categories}
                        onCategorySelect={handleCategorySelect}
                        selectedCategoryId={settings.category}
                        isOpen={isOpen}
                        onToggle={() => setIsOpen(!isOpen)}
                    />
                </aside>

                <main className={`main-content`} style={{left: sidebarWidth}}>
                    {/* Treemap under the title (component includes its own panel) */}

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                            <button onClick={clearError} className="close-error">
                                &times;
                            </button>
                        </div>
                    )}

                    <ThemeTreemap
                        questions={questions}
                        categories={categories}
                        onCategorySelect={handleCategorySelect}
                        selectedCategoryId={settings.category}
                    />

                    {/* Left column: CategoryCountWidget then TypeBarChart; Right column: DifficultyPieChart */}
                    <div className="widgets-row">
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <CategoryCountWidget
                                selectedCategoryId={settings.category}
                                categories={categories}
                                questions={questions}
                            />
                            <TypeBarChart
                                questions={questions}
                                categories={categories}
                                selectedCategoryId={settings.category}
                            />
                        </div>

                        <div style={{flex: 1}}>
                            <DifficultyPieChart
                                questions={questions}
                                categories={categories}
                                selectedCategoryId={settings.category}
                            />
                        </div>
                    </div>


                </main>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    );
};
