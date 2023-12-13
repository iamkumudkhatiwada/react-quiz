import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextQuestion from "./NextQuestion";
import Progress from "./Progress";

import Footer from "./Footer";
import Timer from "./Timer";
import FinishScreen from "./FinishScreen";

const SECS_PER_QUESTION = 30;
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "react-quiz/questions"
    : "http://localhost:8000/questions";

const initialState = {
  questions: [],
  //"loading", "error", "ready", "active", "finished"
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return { ...state, status: "finished" };
    case "restart":
      return {
        ...state,
        status: "ready",
        index: 0,
        points: 0,
        answer: null,
        secondsRemaining: 10,
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Unknown Action");
  }
}
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { questions, status, index, answer, points, secondsRemaining } = state;
  useEffect(function () {
    fetch(baseUrl)
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);
  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (accum, curr) => accum + curr.points,
    0
  );
  return (
    <div className="App">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              answer={answer}
              maxPossiblePoints={maxPossiblePoints}
              index={index}
              numQuestions={numQuestions}
              points={points}
            />
            <Question
              question={questions[index]}
              answer={answer}
              dispatch={dispatch}
            />
            <Footer>
              <Timer secondsRemaining={secondsRemaining} dispatch={dispatch} />
              <NextQuestion
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <>
            <FinishScreen
              points={points}
              maxPossiblePoints={maxPossiblePoints}
            />
            <button
              onClick={() => dispatch({ type: "restart" })}
              className="btn btn-ui"
            >
              Restart Quiz
            </button>
          </>
        )}
      </Main>
    </div>
  );
}
