import { initSelectOptions } from './actions/generate';
import {
  categorySelect,
  difficultySelect,
  formElement,
  triviaButtonElement,
  triviaElement,
  triviaOptionsElement,
  triviaPointsElement,
  triviaQuestionElement,
  typesSelect
} from './selectors';
import { TYPES, ANSWER_VALUE, AMOUNT } from './config/constants';
import { generateTrivia } from './services/api';

initSelectOptions();

// remove on this way due to innerHTML = "" doesnt remove event handlers
// and to void memory leaks
const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

const showTriviaForm = () => {
  formElement.classList.remove('hidden');
  triviaElement.classList.add('hidden');
};

const showQuestion = (question, type) => {
  // clean question container;
  removeAllChildNodes(triviaQuestionElement);
  removeAllChildNodes(triviaOptionsElement);
  const questionNode = document.createTextNode(question.question);
  triviaQuestionElement.appendChild(questionNode);
  // making sure to randomize answers
  const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
  return answers.map((answer) => {
    const labelElement = document.createElement('label');
    const inputRadio = document.createElement('input');
    const answerContainer = document.createElement('span');
    const answerNode = document.createTextNode(answer);
    inputRadio.type = 'radio';
    inputRadio.name = 'triviaAnswer';
    inputRadio.classList.add('form-radio', 'h-5', 'w-5', 'text-purple-600');
    inputRadio.value = answer;
    inputRadio.id = answer.replace(/\s/g, '');
    labelElement.for = answer.replace(/\s/g, '');
    labelElement.appendChild(answerNode);
    labelElement.classList.add('inline-flex', 'items-center', 'mt-3', 'ml-5');
    answerContainer.classList.add('ml-2', 'text-gray-700');
    answerContainer.appendChild(answerNode);
    labelElement.appendChild(inputRadio);
    labelElement.appendChild(answerContainer);
    triviaOptionsElement.appendChild(labelElement);
  });
};

const isCorrectAnswer = (question) => {
  const correctOption = document.getElementById(question.correct_answer.replace(/\s/g, ''));
  return correctOption.checked;
};

const setTriviaPoints = (points) => {
  const pointsNodeText = document.createTextNode(`Points: ${points}`);
  removeAllChildNodes(triviaPointsElement);
  triviaPointsElement.appendChild(pointsNodeText);
};

const startTrivia = (questions, type) => {
  if (questions.length === 0) {
    alert('There is no question to load');
    return showFormTrivia();
  }
  let indexQuestion = 0;
  let userPoints = 0;
  setTriviaPoints(userPoints);
  const initialNodeText = document.createTextNode(`Next`);
  triviaButtonElement.appendChild(initialNodeText);
  formElement.classList.add('hidden');
  triviaElement.classList.remove('hidden');
  showQuestion(questions[indexQuestion], type);
  triviaButtonElement.onclick = () => {
    if (indexQuestion === AMOUNT) {
      return showTriviaForm();
    }
    if (indexQuestion === AMOUNT - 1) {
      const generateNodeText = document.createTextNode(`Start Again`);
      removeAllChildNodes(triviaButtonElement);
      // clean question container;
      removeAllChildNodes(triviaQuestionElement);
      removeAllChildNodes(triviaOptionsElement);
      indexQuestion += 1;
      return triviaButtonElement.appendChild(generateNodeText);
    }
    if (isCorrectAnswer(questions[indexQuestion])) {
      userPoints += ANSWER_VALUE;
      setTriviaPoints(userPoints);
    }
    indexQuestion += 1;
    showQuestion(questions[indexQuestion], type);
  };
};

formElement.onsubmit = (e) => {
  e.preventDefault();
  generateTrivia(categorySelect.value, difficultySelect.value, typesSelect.value).then(({ data }) => {
    startTrivia(data.results, typesSelect.value);
  });
};
