import React, { useCallback,useEffect, useState } from 'react';
import { BiCheckCircle,BiChevronRight, BiTimeFive, BiXCircle } from 'react-icons/bi';

import quizService from '../../services/user/quizService';

interface Question {
  text: string;
  options: string[];
}

interface QuizPlayProps {
  quizId: string;
  questions: Question[];
  onComplete: () => void;
  onCancel: () => void;
}

const TIMER_DURATION = 15;

const QuizPlay: React.FC<QuizPlayProps> = ({ quizId, questions, onComplete, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswerIndex: number;
    explanation: string;
  } | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleNext = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setTimer(TIMER_DURATION);
      setSelectedIdx(null);
      setFeedback(null);
      setIsAnswering(false);
    } else {
      onComplete();
    }
  }, [currentIdx, questions.length, onComplete]);

  const handleAnswer = useCallback(async (optionIdx: number, timeSpent: number) => {
    if (isAnswering || feedback) return;

    setIsAnswering(true);
    setSelectedIdx(optionIdx);

    const actualTimeTaken = TIMER_DURATION - timeSpent;

    try {
      const response = await quizService.checkAnswer({
        quizId,
        questionIndex: currentIdx,
        selectedOption: optionIdx,
        timeTaken: actualTimeTaken,
      });

      setFeedback(response.data);
    } catch (error) {
      console.error('Failed to check answer', error);
      setIsAnswering(false);
    }
  }, [quizId, currentIdx, isAnswering, feedback]);

  useEffect(() => {
    if (feedback) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswer(-1, 0); // timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIdx, feedback, handleAnswer]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col min-h-[400px] border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white/60 backdrop-blur-md">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2">
        <div
          className="bg-rose-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

    <div className="p-4 sm:p-6 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
          QUESTION {currentIdx + 1} / {questions.length}
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className={`p-1 pl-2 pr-1 rounded-full flex items-center justify-center border border-transparent shadow-sm transition-colors ${
              timer <= 5 ? 'border-rose-200 text-rose-500 bg-rose-50/50' : 'border-slate-50 text-slate-700 bg-slate-50/50'
            }`}>
              <BiTimeFive className="text-xl" />
              <span className="ml-2 font-black text-xl sm:text-2xl w-8 text-center">{timer}</span>
            </div>
            <button
               onClick={onCancel}
               className="cursor-pointer p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all duration-300 transform active:scale-95 border border-transparent hover:border-rose-100 shadow-sm"
               title="Cancel Quiz"
            >
              <BiXCircle className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-6 sm:mb-8">
            {currentQuestion.text}
          </h2>

           <div className="grid grid-cols-1 gap-4 mb-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = feedback?.correctAnswerIndex === idx;
              const isWrong = feedback && isSelected && !isCorrect;

              let btnClass = 'bg-white border-2 border-slate-100 text-slate-700 hover:border-rose-200';
              if (isSelected && !feedback) btnClass = 'bg-rose-50 border-rose-500 text-rose-800 shadow-inner';
              if (isCorrect) btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10';
              if (isWrong) btnClass = 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/10';

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx, timer)}
                  disabled={!!feedback || isAnswering}
                  className={`cursor-pointer group relative flex items-center text-left px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all duration-300 font-bold text-sm sm:text-base disabled:cursor-not-allowed transform ${btnClass}`}
                >
                  <span className="flex-1">{option}</span>
                  {isCorrect && <BiCheckCircle className="text-xl ml-3 flex-shrink-0" />}
                  {isWrong && <BiXCircle className="text-xl ml-3 flex-shrink-0" />}
                </button>
              );
            })}
           </div>
        </div>

        {feedback && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mt-6 transition-all border-l-8 border-l-rose-500">
            <p className="text-slate-800 mb-4 line-clamp-4 leading-relaxed font-semibold italic text-base sm:text-lg px-2">
              <span className="text-rose-500 mr-2 uppercase text-[10px] font-black tracking-widest not-italic">Insight:</span>
              &quot;{feedback.explanation}&quot;
            </p>
            <button
              onClick={handleNext}
              className="cursor-pointer w-full flex items-center justify-center bg-slate-900 hover:bg-black text-white py-3 rounded-xl transition-all font-black text-lg shadow-xl transform active:scale-[0.98] tracking-widest group"
            >
              {currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Continue'}
              <BiChevronRight className="ml-2 text-2xl group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlay;
