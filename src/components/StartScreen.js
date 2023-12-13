function StartScreen({ numQuestions, dispatch }) {
  return (
    <div className="start">
      <h2>Welcome to the Ultimate React Quiz!!!</h2>
      <h3>{numQuestions} Questions to test your React Knowledge</h3>
      <button
        onClick={() => dispatch({ type: "start" })}
        className="btn btn-ui"
      >
        Let's get Started
      </button>
    </div>
  );
}

export default StartScreen;
