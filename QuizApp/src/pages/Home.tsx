import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonProgressBar,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { checkmark, close, trophy, refresh } from 'ionicons/icons';
import './Home.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the largest mammal?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Rhinoceros"],
    correctAnswer: 1
  }
];

const Home: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    if (answerIndex === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizFinished(false);
    setAnswered(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return "Excellent! 🎉";
    if (percentage >= 60) return "Good job! 👍";
    if (percentage >= 40) return "Not bad! 😊";
    return "Keep practicing! 💪";
  };

  const getAnswerColor = (index: number) => {
    if (!answered) return "medium";
    if (index === quizQuestions[currentQuestion].correctAnswer) return "success";
    if (index === selectedAnswer && index !== quizQuestions[currentQuestion].correctAnswer) return "danger";
    return "medium";
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Quiz App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Quiz App</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        {!quizFinished ? (
          <div className="quiz-container">
            <IonCard>
              <IonCardHeader>
                <div className="progress-info">
                  <IonText>
                    <p>Question {currentQuestion + 1} of {quizQuestions.length}</p>
                  </IonText>
                  <IonText>
                    <p>Score: {score}</p>
                  </IonText>
                </div>
                <IonProgressBar value={(currentQuestion + 1) / quizQuestions.length}></IonProgressBar>
              </IonCardHeader>
              
              <IonCardContent>
                <IonCardTitle className="question-text">
                  {quizQuestions[currentQuestion].question}
                </IonCardTitle>
                
                <div className="options-container">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <IonButton
                      key={index}
                      fill={selectedAnswer === index ? "solid" : "outline"}
                      color={getAnswerColor(index)}
                      expand="block"
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answered}
                      className="option-button"
                    >
                      <div className="option-content">
                        <span>{option}</span>
                        {answered && index === quizQuestions[currentQuestion].correctAnswer && (
                          <IonIcon icon={checkmark} />
                        )}
                        {answered && index === selectedAnswer && index !== quizQuestions[currentQuestion].correctAnswer && (
                          <IonIcon icon={close} />
                        )}
                      </div>
                    </IonButton>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <div className="result-container">
            <IonCard>
              <IonCardContent className="result-content">
                <IonIcon icon={trophy} className="trophy-icon" />
                <IonCardTitle>Quiz Complete!</IonCardTitle>
                <div className="score-display">
                  <IonText>
                    <h2>Your Score: {score} / {quizQuestions.length}</h2>
                  </IonText>
                  <IonText>
                    <p>Percentage: {Math.round((score / quizQuestions.length) * 100)}%</p>
                  </IonText>
                  <IonText className="score-message">
                    <h3>{getScoreMessage()}</h3>
                  </IonText>
                </div>
                
                <IonButton
                  expand="block"
                  onClick={resetQuiz}
                  className="restart-button"
                >
                  <IonIcon icon={refresh} slot="start" />
                  Take Quiz Again
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
