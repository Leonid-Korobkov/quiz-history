// Стартовый экран
const quizStartScreen = document.querySelector('.quiz__screen-start')
const quizButtonStart = document.querySelector('.quiz__button_start')

// Квиз и вопросы
const quizQuestionContainer = document.querySelector('.quiz__question-container')
const quizQuestionTitle = document.querySelector('.quiz__title_question')
const quizQuestionImageContainer = document.querySelector('.quiz__image')
const quizQuestionListAnswers = document.querySelector('.quiz__list')
const quizButtonQuestion = document.querySelector('.quiz__button_question')
const quizQuestionWrapper = document.querySelector('.quiz__question-wrapper')

// Прогресс бар
const quizProgressFill = document.querySelector('.quiz__progress-fill')
const quizProgressCurrentNumber = document.querySelector('.quiz__progress-question_current')
const quizProgressAmountNumber = document.querySelector('.quiz__progress-question_amount')

// Экран с результатами
const quizResultScreen = document.querySelector('.quiz__result-screen')
const quizButtonRestart = document.querySelector('.quiz__button_restart')

// Массив вопросов
const questions = [
  {
    question: 'Вопрос 1',
    answers: ['Ответ 1', 'Отвeт 2', 'Ответ 3', 'Ответ 4'],
    correct: 'Ответ 1',
    userAnswer: null,
    descrAnswer: 'Какое-то описание ответа 1',
    numberImg: 1
  },
  {
    question: 'Вопрос 2',
    answers: ['Ответ 1', 'Отвeт 2', 'Ответ 3', 'Ответ 4'],
    correct: 'Ответ 3',
    userAnswer: null,
    descrAnswer: 'Какое-то описание ответа 2',
    numberImg: 2
  },
  {
    question: 'Вопрос 3',
    answers: ['Ответ 1', 'Отвeт 2', 'Ответ 3', 'Ответ 4'],
    correct: 'Ответ 2',
    userAnswer: null,
    descrAnswer: 'Какое-то описание ответа 3',
    numberImg: 3
  }
]

// Переменные игры
let questionIndex = 0
let countQuestions = questions.length


// Cлушатели событий на кнопки (начало игры, следующий вопрос, повтор игры)
quizButtonStart.addEventListener('click', function(e) {
  e.preventDefault()
  quizStartScreen.classList.remove('visible')
  quizQuestionContainer.classList.add('visible')
  randomQuestions()
  renderQuestion()
})
quizButtonQuestion.addEventListener('click', function(e) {
  e.preventDefault()
  const selectedAnswerUser = quizQuestionListAnswers.querySelector('.quiz__item-answer:checked')
  if (!selectedAnswerUser) {
    return
  }
  questions[questionIndex]['userAnswer'] = selectedAnswerUser.value
  questionIndex++
  renderQuestion()
})
quizButtonRestart.addEventListener('click', function(e) {
  e.preventDefault()
  questionIndex = 0
  randomQuestions()
  renderQuestion()
  quizResultScreen.classList.remove('visible')
  quizQuestionContainer.classList.add('visible')
  quizStartScreen.classList.remove('visible')
})

function renderQuestion() {
  if (questionIndex === questions.length) {
    renderProgressBar(true)
    setTimeout(() => {
      quizQuestionContainer.classList.remove('visible')
      quizResultScreen.classList.add('visible')
    }, 300)
    return
  }

  let questionTitleText = questions[questionIndex]['question']
  let questionImgHTML = `<img src="img/questions/${questions[questionIndex]['numberImg']}.jpg" alt="">`

  let questionListAnswersHTML = ``
  questions[questionIndex]['answers'].forEach((item, i) => {
    questionListAnswersHTML += `
        <li class="quiz__item">
          <input type="radio" name="answer" class="quiz__item-answer" id="quiz__item-answer_${i + 1}" value="${item}">
          <label for="quiz__item-answer_${i + 1}">
            <span>${item}</span>
          </label>
        </li>`
  })

  quizQuestionTitle.textContent = questionTitleText
  quizQuestionImageContainer.innerHTML = questionImgHTML
  quizQuestionListAnswers.innerHTML = questionListAnswersHTML

  if (questionIndex === questions.length - 1) {
    quizButtonQuestion.textContent = 'закончить'
  } else {
    quizButtonQuestion.textContent = 'ответить'
  }
  renderProgressBar()
}

function renderProgressBar(isLastQuestion = false) {
  if (!isLastQuestion) {
    quizProgressAmountNumber.textContent = countQuestions
    quizProgressCurrentNumber.textContent = questionIndex + 1
    quizProgressFill.style.width = `${questionIndex / countQuestions * 100}%`
  } else {
    quizProgressFill.style.width = `${questionIndex / countQuestions * 100}%`
  }
}

function randomQuestions() {
  questions.sort(() => Math.random() - 0.5)
  for (const q of questions) {
    q.answers.sort(() => Math.random() - 0.5)
  }
}
