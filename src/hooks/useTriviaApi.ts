import { useState, useCallback, useEffect } from 'react';
import { TriviaApiService, TriviaApiError } from '../services/triviaApi';
import { 
  Question, 
  Difficulty, 
  QuestionType, 
  Category, 
  ResponseCode,
  CategoryQuestionCountResponse,
  GlobalQuestionCountResponse
} from '../types/trivia';

interface UseTriviaApiReturn {
  // State
  questions: Question[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  token: string | null;
  hasToken: boolean;
  
  // Actions
  requestToken: () => Promise<void>;
  resetToken: () => Promise<void>;
  getQuestions: (amount?: number, category?: number, difficulty?: Difficulty, type?: QuestionType) => Promise<void>;
  getCategories: () => Promise<void>;
  getCategoryQuestionCount: (categoryId: number) => Promise<CategoryQuestionCountResponse | null>;
  getGlobalQuestionCount: () => Promise<GlobalQuestionCountResponse | null>;
  clearError: () => void;
}

export const useTriviaApi = (): UseTriviaApiReturn => {
  const [apiService] = useState(() => new TriviaApiService());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Update token state when it changes in the service
  useEffect(() => {
    setToken(apiService.getToken());
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof TriviaApiError) {
      let errorMessage = error.message;
      
      // Provide user-friendly error messages based on response codes
      switch (error.responseCode) {
        case ResponseCode.NO_RESULTS:
          errorMessage = 'No questions found for your criteria. Try adjusting your filters.';
          break;
        case ResponseCode.INVALID_PARAMETER:
          errorMessage = 'Invalid request parameters. Please check your settings.';
          break;
        case ResponseCode.TOKEN_NOT_FOUND:
          errorMessage = 'Session expired. Please request a new session.';
          break;
        case ResponseCode.TOKEN_EMPTY:
          errorMessage = 'You\'ve seen all available questions! Reset your session to start over.';
          break;
        case ResponseCode.RATE_LIMIT:
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
      }
      
      setError(errorMessage);
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  }, []);

  const requestToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newToken = await apiService.requestToken();
      setToken(newToken);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const getCategoryQuestionCount = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const counts = await apiService.getCategoryQuestionCount(categoryId);
      return counts;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const getGlobalQuestionCount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const counts = await apiService.getGlobalQuestionCount();
      return counts;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const resetToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.resetToken();
      setToken(apiService.getToken());
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const getQuestions = useCallback(async (
    amount: number = 10,
    category?: number,
    difficulty?: Difficulty,
    type?: QuestionType
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedQuestions = await apiService.getQuestions(amount, category, difficulty, type);
      setQuestions(fetchedQuestions);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const getCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getCategories();
      setCategories(response.trivia_categories);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiService, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    questions,
    categories,
    isLoading,
    error,
    token,
    hasToken: apiService.hasToken(),
    
    // Actions
    requestToken,
    resetToken,
    getQuestions,
    getCategories,
    getCategoryQuestionCount,
    getGlobalQuestionCount,
    clearError,
  };
};
