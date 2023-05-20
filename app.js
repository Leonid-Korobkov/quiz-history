'use strict'
import {questions} from './questions.js'
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
const quizQuestionButtonWrapper = document.querySelector('.quiz__button-wrapper_question')

// Прогресс бар
const quizProgressWrap = document.querySelector('.quiz__progress-wrap')
const quizProgressFill = document.querySelector('.quiz__progress-fill')
const quizProgressCurrentNumber = document.querySelector('.quiz__progress-question_current')
const quizProgressAmountNumber = document.querySelector('.quiz__progress-question_amount')

const quizTimeLeft = document.querySelector('.quiz__time-left')

// Экран с результатами
const quizResultScreen = document.querySelector('.quiz__result-screen')
const quizResultScreenWrapper = document.querySelector('.result-screen_wrapper')
const quizButtonRestart = document.querySelector('.quiz__button_restart')
const resultScreenTitle = document.querySelector('.result-screen__title')
const resultScreenDescr = document.querySelector('.result-screen__descr')
const resultScreenTable = document.querySelector('.quiz__table-result')
const resultScreenListAnswers = document.querySelector('.quiz__result-question-list')

const audio = document.getElementsByTagName('audio')[0]

// Переменные игры
let questionIndex = 0
let userScore = 0
let countQuestions = questions.length

// Таймер
const amountTimeSeconds = 30
const totalTime = amountTimeSeconds * countQuestions
let userPassingTime = 0
let countTimeSeconds = amountTimeSeconds
let countdown

const timerDisplay = () => {
  quizTimeLeft.innerHTML = `${countTimeSeconds}с`
  countdown = setInterval(() => {
    countTimeSeconds--
    quizTimeLeft.innerHTML = `${countTimeSeconds}с`
    if (countTimeSeconds == 3) {
      audio.play()
    }
    if (countTimeSeconds == 0) {
      userPassingTime += amountTimeSeconds - parseInt(quizTimeLeft.textContent)
      questionIndex++
      renderQuestion()
    }
  }, 1000)
}

// Cлушатели событий на кнопки (начало игры, следующий вопрос, повтор игры)
quizButtonStart.addEventListener('click', function(e) {
  e.preventDefault()
  quizStartScreen.classList.remove('visible')
  quizQuestionContainer.classList.add('visible')
  randomQuestions()
  renderQuestion()
  animateScrollTo()
})
quizButtonQuestion.addEventListener('click', function(e) {
  e.preventDefault()
  if (checkAnswer()) {
    userPassingTime += amountTimeSeconds - parseInt(quizTimeLeft.textContent)
    renderQuestion()

    // Выключению звука
    audio.pause()
    audio.currentTime = 0
    animateScrollTo()
  }
})
quizButtonRestart.addEventListener('click', function(e) {
  e.preventDefault()
  resetQuizResults()
  randomQuestions()
  renderQuestion()
  quizResultScreen.classList.remove('visible')
  quizQuestionContainer.classList.add('visible')
  quizStartScreen.classList.remove('visible')
  animateScrollTo()
})

function resetQuizResults() {
  questionIndex = 0
  userScore = 0
  userPassingTime = 0

  resultScreenTitle.innerHTML = ''
  resultScreenDescr.innerHTML = ''
  resultScreenTable.innerHTML = ''
  resultScreenListAnswers.innerHTML = ''

  for (let question of questions) {
    question['isRightUserAnswer'] = false
    question['userAnswer'] = null
  }
}

function checkAnswer() {
  const selectedAnswerUser = quizQuestionListAnswers.querySelector('.quiz__item-answer:checked')
  if (!selectedAnswerUser) {
    quizQuestionButtonWrapper.classList.add('error')
    setTimeout(() => {
      quizQuestionButtonWrapper.classList.remove('error')
    }, 2000)
    return false
  }
  quizQuestionButtonWrapper.classList.remove('error')
  questions[questionIndex]['userAnswer'] = selectedAnswerUser.value
  if (questions[questionIndex]['correct'] === questions[questionIndex]['userAnswer']) {
    questions[questionIndex]['isRightUserAnswer'] = true
    userScore++
  }

  questionIndex++

  return true
}

function renderQuestion() {
  // Нажатие кнопки на последнем вопросе
  if (questionIndex === questions.length) {
    renderProgressBar(true)
    setTimeout(() => {
      quizQuestionContainer.classList.remove('visible')
      quizResultScreen.classList.add('visible')
      renderResult()
    }, 300)
    return
  }

  let questionTitleText = questions[questionIndex]['question']
  let questionImgHTML = `<img src="img/questions/${questions[questionIndex]['numberImg']}.jpg" alt="${questionTitleText}">`

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

  countTimeSeconds = amountTimeSeconds
  clearInterval(countdown)
  timerDisplay()
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

function renderResult() {
  clearInterval(countdown)
  audio.pause()
  audio.currentTime = 0

  const percentRightAnswers = (userScore / countQuestions * 100).toFixed()

  let raiting = 0
  if (percentRightAnswers > 85) {
    resultScreenDescr.innerHTML = `<span>Гений!</span>Ты либо Бог, который с начала мира наблюдал за всей его историей, либо всезнающий гений, который преисполнился в своём познании. Молодец!`
    resultScreenTitle.innerHTML = `🎉${userScore} <span>из</span> ${countQuestions}🎉`
    raiting = 5
  } else if (percentRightAnswers > 65) {
    resultScreenDescr.innerHTML = `<span>Отлично!</span>Ты очень хорош в знаниях всеобщей истории, но до гения не дотянул`
    resultScreenTitle.innerHTML = `🎊${userScore} <span>из</span> ${countQuestions}🎊`
    raiting = 4
  } else if (percentRightAnswers > 45) {
    resultScreenDescr.innerHTML = `<span>Лучше чем ничего!</span>Ты знаешь что-то, но не более`
    resultScreenTitle.innerHTML = `🥳${userScore} <span>из</span> ${countQuestions}🥳`
    raiting = 3
  } else if (percentRightAnswers > 1) {
    resultScreenDescr.innerHTML = `<span>Ужасно!</span>Ты далёк от всеобщей истории`
    resultScreenTitle.innerHTML = `😭${userScore} <span>из</span> ${countQuestions}😭`
    raiting = 2
  } else {
    resultScreenDescr.innerHTML = `<span>Как так?</span>Ни одного правильного ответа`
    resultScreenTitle.innerHTML = `🤬🤯${userScore} <span>из</span> ${countQuestions}🤯🤬`
    raiting = 1
  }

  function secondsToMinutes(seconds) {
    seconds = Number(seconds)

    let m = Math.floor(seconds % 3600 / 60)
    let s = Math.floor(seconds % 3600 % 60)

    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2)
  }

  resultScreenTable.innerHTML = `
    <tr>
      <th>Количестов правильных ответов</th>
      <th>${userScore} из ${countQuestions}</th>
    </tr>
    <tr>
      <td>Процент правильных ответов</td>
      <td>${percentRightAnswers}%</td>
    </tr>
    <tr>
      <td>Время прохождения</td>
      <td>${secondsToMinutes(userPassingTime)} из ${secondsToMinutes(totalTime)}</td>
    </tr>
    <tr>
      <td>Оценка</td>
      <td>${raiting}</td>
    </tr>
  `

  resultScreenListAnswers.innerHTML = `<div class="result-question-list__title">Вопросы и ответы</div>`
  questions.forEach((question, index) => {
    let questionListAnswersHTML = ''

    let templateAnswerItem = `
        <li class="quiz__item %cssClass%">
          <label>
            <span>%title%</span>
          </label>
          %description%
        </li>
      `
    // Применение ответам нужные стили
    if (question['isRightUserAnswer']) {
      for (let answer of question['answers']) {
        if (answer !== question['correct']) {
          questionListAnswersHTML += templateAnswerItem
            .replace('%cssClass%', 'quiz__item_answered')
            .replace('%title%', answer)
            .replace('%description%', '')
        } else {
          questionListAnswersHTML += templateAnswerItem
            .replace('%cssClass%', 'quiz__item_right')
            .replace('%title%', answer)
            .replace('%description%', `<div class="result-question-list__answer-descr">${question['descrAnswer']}</div>`)
        }
      }
    } else {
      for (let answer of question['answers']) {
        if (answer === question['correct']) {
          questionListAnswersHTML += templateAnswerItem
            .replace('%cssClass%', 'quiz__item_suppose')
            .replace('%title%', answer)
            .replace('%description%', `<div class="result-question-list__answer-descr">${question['descrAnswer']}</div>`)
        } else if (answer === question['userAnswer']) {
          questionListAnswersHTML += templateAnswerItem
            .replace('%cssClass%', 'quiz__item_wrong')
            .replace('%title%', answer)
            .replace('%description%', '')
        } else {
          questionListAnswersHTML += templateAnswerItem
            .replace('%cssClass%', 'quiz__item_answered')
            .replace('%title%', answer)
            .replace('%description%', '')
        }
      }
    }

    const questionHTML = `
    <div class="result-question-list__item">
      <div class="quiz__question-wrapper">
        <h4 class="quiz__title quiz__title_question main-title">${index + 1}) ${question['question']}</h4>
        <div class="quiz__question">
          <div class="quiz__image">
            <img src="img/questions/${question['numberImg']}.jpg" alt="${question['question']}">
          </div>
          <ul class="quiz__list">${questionListAnswersHTML}</ul>
        </div>
      </div>
    </div>
    `
    resultScreenListAnswers.insertAdjacentHTML('beforeend', questionHTML)
  })
}

function getHeaderHeight() {
  return document.querySelector('.header').scrollHeight
}
function animateScrollTo() {
  window.scrollTo({
    top: getHeaderHeight(),
    left: 0,
    behavior: 'smooth'
  })
}