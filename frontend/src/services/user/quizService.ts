import axios from '~utils/axiosConfig';

export interface GenerateQuizRequest {
  language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  volume: number;
}

export interface CheckAnswerRequest {
  quizId: string;
  questionIndex: number;
  selectedOption: number;
  timeTaken: number;
}

export interface CompleteQuizRequest {
  quizId: string;
}

const quizService = {
  generateQuiz: async (data: GenerateQuizRequest) => {
    const response = await axios.post('/user/quizzes', data);
    return response.data;
  },

  checkAnswer: async (data: CheckAnswerRequest) => {
    const response = await axios.post('/user/quizzes/check-answer', data);
    return response.data;
  },

  completeQuiz: async (data: CompleteQuizRequest) => {
    const response = await axios.post('/user/quizzes/complete', data);
    return response.data;
  },

  getHistory: async (page: number, limit: number) => {
    const response = await axios.get(`/user/quizzes/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getLeaderboard: async (page: number, limit: number) => {
    const response = await axios.get(`/user/quizzes/leaderboard?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default quizService;
