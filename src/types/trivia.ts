// API Response Codes
export enum ResponseCode {
    SUCCESS = 0,
    NO_RESULTS = 1,
    INVALID_PARAMETER = 2,
    TOKEN_NOT_FOUND = 3,
    TOKEN_EMPTY = 4,
    RATE_LIMIT = 5
}

// Question difficulty levels
export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

// Question types
export enum QuestionType {
    MULTIPLE = 'multiple',
    BOOLEAN = 'boolean'
}

// Category interface
export interface Category {
    id: number;
    name: string;
}

// Question interface
export interface Question {
    category: string;
    type: QuestionType;
    difficulty: Difficulty;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

// Base API response interface
export interface BaseApiResponse {
    response_code: ResponseCode;
}

// Token request response
export interface TokenResponse extends BaseApiResponse {
    response_message?: string;
    token?: string;
}

// Questions response
export interface QuestionsResponse extends BaseApiResponse {
    results: Question[];
}

// Categories response
export interface CategoriesResponse {
    trivia_categories: Category[];
}

// Category question count response
export interface CategoryQuestionCountResponse {
    category_id: number;
    category_question_count: {
        total_question_count: number;
        total_easy_question_count: number;
        total_medium_question_count: number;
        total_hard_question_count: number;
    };
}

// Global question count response
export interface GlobalQuestionCountResponse {
    overall: {
        total_num_of_questions: number;
        total_num_of_pending_questions: number;
        total_num_of_verified_questions: number;
        total_num_of_rejected_questions: number;
    };
}
