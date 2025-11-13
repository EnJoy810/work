import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const QuestionNavigator = ({ questions, currentQuestionId, onQuestionSelect }) => {
  const choiceQuestions = questions.filter((question) => question.type === "choice");
  const subjectiveQuestions = questions.filter((question) => question.type !== "choice");

  return (
    <div className="question-nav">
      <div className="question-nav__groups">
        <div className="question-nav__group">
          <span className="question-nav__badge question-nav__badge--choice">
            选择题
            <span>●</span>
          </span>
          {choiceQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              className={`question-nav__button${currentQuestionId === question.id ? " question-nav__button--active" : ""}`}
              onClick={() => onQuestionSelect(question.id)}
            >
              {question.id}
            </button>
          ))}
        </div>
        <div className="question-nav__group">
          <span className="question-nav__badge question-nav__badge--subjective">
            非选择题
            <ChevronDown size={14} />
          </span>
          {subjectiveQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              className={`question-nav__button${currentQuestionId === question.id ? " question-nav__button--active" : ""}`}
              onClick={() => onQuestionSelect(question.id)}
            >
              {question.title}
            </button>
          ))}
        </div>
        <Link to="/" className="question-nav__back">
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default QuestionNavigator;
