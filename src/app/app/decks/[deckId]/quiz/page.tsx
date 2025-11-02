'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type QuizMode = 'image-to-text' | 'text-to-image' | 'write-answer';

interface QuizQuestion {
  id: string;
  mode: QuizMode;
  correctCard: {
    id: string;
    front: string;
    back: string;
    imageUrl: string;
  };
  options?: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/decks/${deckId}/quiz?count=10`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to load quiz');
          router.push(`/app/decks/${deckId}`);
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        alert('Failed to load quiz');
        router.push(`/app/decks/${deckId}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (deckId) {
      fetchQuiz();
    }
  }, [deckId, router]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionId: string) => {
    if (showResult) return;

    setSelectedAnswer(optionId);
    setShowResult(true);

    if (optionId === currentQuestion.correctCard.id) {
      setScore(score + 1);
    }
  };

  const handleWrittenAnswer = () => {
    if (showResult || !writtenAnswer.trim()) return;

    setShowResult(true);

    // Check if answer is correct (case-insensitive, trimmed)
    const isCorrect = writtenAnswer.trim().toLowerCase() === currentQuestion.correctCard.back.toLowerCase();
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setWrittenAnswer('');
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No quiz available. You need at least 4 cards with images.
            </p>
            <Link href={`/app/decks/${deckId}`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deck
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/app/decks/${deckId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deck
            </Button>
          </Link>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
              </div>
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-2xl text-muted-foreground mb-4">
                Score: {score} / {questions.length} ({percentage}%)
              </p>
              <p className="text-muted-foreground">
                {percentage >= 80
                  ? 'Excellent work!'
                  : percentage >= 60
                  ? 'Good job! Keep practicing.'
                  : 'Keep studying and try again!'}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link href={`/app/decks/${deckId}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Deck
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/app/decks/${deckId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Score: {score}</span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {currentQuestion.mode === 'image-to-text'
                ? 'Which image matches this name?'
                : currentQuestion.mode === 'write-answer'
                ? 'Write the name of this bird'
                : 'Select the correct name for this image'}
            </span>
            <Badge variant="outline">
              {currentQuestion.mode === 'image-to-text' 
                ? 'Images → Text' 
                : currentQuestion.mode === 'write-answer'
                ? 'Write Answer'
                : 'Image → Text'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode 1: 4 images, select correct name */}
          {currentQuestion.mode === 'image-to-text' && (
            <>
              <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-muted-foreground mb-1">Find the image for:</p>
                <p className="text-2xl font-bold text-blue-900">{currentQuestion.correctCard.back}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options?.map((option) => (
                <div
                  key={option.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedAnswer === option.id
                      ? option.id === currentQuestion.correctCard.id
                        ? 'border-green-500 ring-2 ring-green-500'
                        : 'border-red-500 ring-2 ring-red-500'
                      : showResult && option.id === currentQuestion.correctCard.id
                      ? 'border-green-500 ring-2 ring-green-500'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  onClick={() => !showResult && handleAnswer(option.id)}
                >
                  <img
                    src={option.imageUrl}
                    alt="Quiz option"
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                  {showResult && option.id === currentQuestion.correctCard.id && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  {showResult && selectedAnswer === option.id && option.id !== currentQuestion.correctCard.id && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              </div>
            </>
          )}

          {/* Mode 2: 1 image, 4 text options */}
          {currentQuestion.mode === 'text-to-image' && (
            <>
              <div className="flex justify-center mb-6">
                <img
                  src={currentQuestion.correctCard.imageUrl}
                  alt="Quiz question"
                  className="rounded-lg max-h-96 object-contain"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !showResult && handleAnswer(option.id)}
                    disabled={showResult}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      selectedAnswer === option.id
                        ? option.id === currentQuestion.correctCard.id
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-red-500 bg-red-50 text-red-900'
                        : showResult && option.id === currentQuestion.correctCard.id
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {showResult && option.id === currentQuestion.correctCard.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {showResult && selectedAnswer === option.id && option.id !== currentQuestion.correctCard.id && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Mode 3: Write the answer */}
          {currentQuestion.mode === 'write-answer' && (
            <>
              <div className="flex justify-center mb-6">
                <img
                  src={currentQuestion.correctCard.imageUrl}
                  alt="Quiz question"
                  className="rounded-lg max-h-96 object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Type your answer:
                  </label>
                  <Input
                    type="text"
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !showResult) {
                        handleWrittenAnswer();
                      }
                    }}
                    placeholder="Enter the name..."
                    disabled={showResult}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                {!showResult && (
                  <Button 
                    onClick={handleWrittenAnswer} 
                    disabled={!writtenAnswer.trim()}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Result and Next Button */}
          {showResult && (
            <div className="pt-4 border-t">
              {(() => {
                const isCorrect = currentQuestion.mode === 'write-answer'
                  ? writtenAnswer.trim().toLowerCase() === currentQuestion.correctCard.back.toLowerCase()
                  : selectedAnswer === currentQuestion.correctCard.id;
                
                return (
                  <div className={`p-4 rounded-lg mb-4 ${
                    isCorrect
                      ? 'bg-green-50 text-green-900'
                      : 'bg-red-50 text-red-900'
                  }`}>
                    <p className="font-semibold mb-1">
                      {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {currentQuestion.mode === 'write-answer' && !isCorrect && (
                      <p className="text-sm mb-1">
                        Your answer: <strong>{writtenAnswer}</strong>
                      </p>
                    )}
                    <p className="text-sm">
                      The correct answer is: <strong>{currentQuestion.correctCard.back}</strong>
                    </p>
                  </div>
                );
              })()}
              <Button onClick={handleNext} className="w-full">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

