import {
    ResponseCode,
    TokenResponse,
    QuestionsResponse,
    CategoriesResponse,
    CategoryQuestionCountResponse,
    GlobalQuestionCountResponse,
    Question,
    Difficulty,
    QuestionType
} from '../types/trivia';

const BASE_URL = 'https://opentdb.com';

export class TriviaApiError extends Error {
    constructor(
        message: string,
        public responseCode: ResponseCode,
        public responseMessage?: string
    ) {
        super(message);
        this.name = 'TriviaApiError';
    }
}

export class TriviaApiService {
    private token: string | null = null;
    private lastRequestTime: number = 0;
    private readonly RATE_LIMIT_DELAY = 5000; // 5 seconds in milliseconds

    /**
     * Get a new session token from the API
     */
    async requestToken(): Promise<string> {
        try {
            const response = await fetch(`${BASE_URL}/api_token.php?command=request`);
            const data: TokenResponse = await response.json();

            if (data.response_code === ResponseCode.SUCCESS && data.token) {
                this.token = data.token;
                return data.token;
            } else {
                throw new TriviaApiError(
                    'Failed to retrieve session token',
                    data.response_code,
                    data.response_message
                );
            }
        } catch (error) {
            if (error instanceof TriviaApiError) {
                throw error;
            }
            throw new TriviaApiError(
                'Network error while requesting token',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Reset the current session token
     */
    async resetToken(): Promise<void> {
        if (!this.token) {
            throw new TriviaApiError(
                'No token to reset',
                ResponseCode.TOKEN_NOT_FOUND
            );
        }

        try {
            const response = await fetch(
                `${BASE_URL}/api_token.php?command=reset&token=${this.token}`
            );
            const data: TokenResponse = await response.json();

            if (data.response_code !== ResponseCode.SUCCESS) {
                throw new TriviaApiError(
                    'Failed to reset token',
                    data.response_code,
                    data.response_message
                );
            }
        } catch (error) {
            if (error instanceof TriviaApiError) {
                throw error;
            }
            throw new TriviaApiError(
                'Network error while resetting token',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get trivia questions with optional parameters
     */
    async getQuestions(
        amount: number = 10,
        category?: number,
        difficulty?: Difficulty,
        type?: QuestionType
    ): Promise<Question[]> {
        return this.fetchQuestions(amount, category, difficulty, type, 0);
    }

    private async fetchQuestions(
        amount: number = 10,
        category?: number,
        difficulty?: Difficulty,
        type?: QuestionType,
        attempt: number = 0
    ): Promise<Question[]> {
        // Rate limiting check
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
            const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Build query parameters
        const params = new URLSearchParams();
        params.append('amount', amount.toString());

        if (category) {
            params.append('category', category.toString());
        }
        if (difficulty) {
            params.append('difficulty', difficulty);
        }
        if (type) {
            params.append('type', type);
        }
        if (this.token) {
            params.append('token', this.token);
        }

        try {
            const response = await fetch(`${BASE_URL}/api.php?${params.toString()}`);
            const data: QuestionsResponse = await response.json();

            this.lastRequestTime = Date.now();

            // Handle different response codes
            switch (data.response_code) {
                case ResponseCode.SUCCESS:
                    return data.results;

                case ResponseCode.NO_RESULTS:
                    throw new TriviaApiError(
                        'No results found for the specified query parameters',
                        ResponseCode.NO_RESULTS
                    );

                case ResponseCode.INVALID_PARAMETER:
                    throw new TriviaApiError(
                        'Invalid parameter provided',
                        ResponseCode.INVALID_PARAMETER
                    );

                case ResponseCode.TOKEN_NOT_FOUND:
                    // Token is invalid; try to request a new token once and retry
                    this.token = null;
                    if (attempt === 0) {
                        await this.requestToken();
                        return this.fetchQuestions(amount, category, difficulty, type, 1);
                    }
                    throw new TriviaApiError(
                        'Session token not found. Please request a new token.',
                        ResponseCode.TOKEN_NOT_FOUND
                    );

                case ResponseCode.TOKEN_EMPTY:
                    // Token exhausted; try to reset once and retry
                    if (attempt === 0 && this.token) {
                        await this.resetToken();
                        return this.fetchQuestions(amount, category, difficulty, type, 1);
                    }
                    throw new TriviaApiError(
                        'Session token has returned all possible questions. Reset the token to continue.',
                        ResponseCode.TOKEN_EMPTY
                    );

                case ResponseCode.RATE_LIMIT:
                    throw new TriviaApiError(
                        'Rate limit exceeded. Please wait 5 seconds before making another request.',
                        ResponseCode.RATE_LIMIT
                    );

                default:
                    throw new TriviaApiError(
                        'Unknown response code',
                        data.response_code
                    );
            }
        } catch (error) {
            if (error instanceof TriviaApiError) {
                throw error;
            }
            throw new TriviaApiError(
                'Network error while fetching questions',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get all available categories
     */
    async getCategories(): Promise<CategoriesResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api_category.php`);
            const data: CategoriesResponse = await response.json();
            return data;
        } catch (error) {
            throw new TriviaApiError(
                'Network error while fetching categories',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get question counts for a specific category
     */
    async getCategoryQuestionCount(categoryId: number): Promise<CategoryQuestionCountResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api_count.php?category=${encodeURIComponent(categoryId)}`);
            const data: CategoryQuestionCountResponse = await response.json();
            return data;
        } catch (error) {
            throw new TriviaApiError(
                'Network error while fetching category question count',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get global question counts
     */
    async getGlobalQuestionCount(): Promise<GlobalQuestionCountResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api_count_global.php`);
            const data: GlobalQuestionCountResponse = await response.json();
            return data;
        } catch (error) {
            throw new TriviaApiError(
                'Network error while fetching global question count',
                ResponseCode.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get the current session token
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * Check if we have a valid token
     */
    hasToken(): boolean {
        return this.token !== null;
    }

    /**
     * Clear the current token (useful for logout scenarios)
     */
    clearToken(): void {
        this.token = null;
    }
}
