'use strict'
import { quiz } from './questions.js'
// Стартовый экран
const quizStartScreen = document.querySelector('.quiz__screen-start')
const quizSelectQuizList = document.querySelector('.select-quiz__list')

// Квиз и вопросы
const quizQuestionContainer = document.querySelector('.quiz__question-container')
const quizQuestionTitle = document.querySelector('.quiz__title_question')
const quizQuestionImageContainer = document.querySelector('.quiz__image')
const quizQuestionListAnswers = document.querySelector('.quiz__list')
const quizButtonQuestion = document.querySelector('.quiz__button_question')
const quizQuestionButtonWrapper = document.querySelector('.quiz__button-wrapper_question')

// Прогресс бар
const quizProgressFill = document.querySelector('.quiz__progress-fill')
const quizProgressCurrentNumber = document.querySelector('.quiz__progress-question_current')
const quizProgressAmountNumber = document.querySelector('.quiz__progress-question_amount')

const quizTimeLeft = document.querySelector('.quiz__time-left')

// Экран с результатами
const quizResultScreen = document.querySelector('.quiz__result-screen')
const quizButtonRestart = document.querySelector('.quiz__button_restart')
const quizButtonToStartScreen = document.querySelector('.quiz__button_to-start-screen')
const resultScreenTitle = document.querySelector('.result-screen__title')
const resultScreenDescr = document.querySelector('.result-screen__descr')
const resultScreenTable = document.querySelector('.quiz__table-result')
const resultScreenListAnswers = document.querySelector('.quiz__result-question-list')
const footerYear = document.querySelector('.version')

const audio = document.getElementsByTagName('audio')[0]

if (footerYear) {
  footerYear.textContent = new Date().getFullYear()
}

/**
 * Функция для плавной смены экранов с анимацией ухода и появления
 * @param {HTMLElement} screenToShow - Экран, который нужно показать
 * @param {HTMLElement[]} screensToHide - Массив экранов, которые нужно скрыть
 */
async function changeScreen(screenToShow, screensToHide = []) {
  // 1. Запускаем анимацию ухода для всех видимых экранов из списка
  const exitPromises = screensToHide.map(screen => {
    if (screen.classList.contains('visible')) {
      screen.classList.add('exiting');
      return new Promise(resolve => {
        screen.addEventListener('animationend', () => {
          screen.classList.remove('visible', 'exiting');
          resolve();
        }, { once: true });
      });
    }
  }).filter(Boolean);

  // Ждем пока все текущие экраны закончат анимацию исчезновения
  if (exitPromises.length > 0) {
    await Promise.all(exitPromises);
  } else {
    // Если ничего не было активно, просто очищаем классы на всякий случай
    screensToHide.forEach(s => s.classList.remove('visible', 'exiting'));
  }

  // 2. Показываем новый экран
  if (screenToShow) {
    screenToShow.classList.add('visible');
  }
}

function renderQuizItemsOnStartScreen() {
  const fragment = document.createDocumentFragment()
  quiz.forEach(item => {
    const quizItem = document.createElement('div')
    quizItem.className = 'select-quiz__item'

    const quizTitle = document.createElement('div')
    quizTitle.className = 'select-quiz__title'
    quizTitle.textContent = item.nameQuiz

    const buttonWrapper = document.createElement('div')
    buttonWrapper.className = 'select-quiz__button-wrapper'

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'quiz__button quiz__button_select-quiz'
    button.textContent = 'начать'
    button.setAttribute('aria-label', `Начать раздел: ${item.nameQuiz}`)

    buttonWrapper.append(button)
    quizItem.append(quizTitle, buttonWrapper)
    fragment.append(quizItem)
  })
  quizSelectQuizList.append(fragment)
}
renderQuizItemsOnStartScreen()

const quizButtonsStart = document.querySelectorAll('.quiz__button_select-quiz')

let arrLoadedImages = []
function generateLoadingImageHTML(numberQuiz, countQuestions) {
  let listHTML = ``
  for (let i = 0; i < countQuestions; i++) {
    listHTML += `<link rel="prefetch" as="image" href="img/questions/${numberQuiz + 1}/${i + 1}.jpg">`
  }
  arrLoadedImages.push(numberQuiz)
  return listHTML
}

let q
quizButtonsStart.forEach((button, index) => {
  button.addEventListener('click', e => {
    e.preventDefault()
    changeScreen(quizQuestionContainer, [quizResultScreen, quizStartScreen]);

    q = new InitQuiz(index)
    if (!arrLoadedImages.includes(index)) {
      document.head.insertAdjacentHTML('beforeend', generateLoadingImageHTML(index, quiz[index]['questions'].length))
    }
    q.resetQuizResults()
    q.randomQuestions()
    q.renderQuestion()
    // q.animateScrollTo()
  })
})

class InitQuiz {
  constructor(indexCurrentQuiz) {
    this.indexCurrentQuiz = indexCurrentQuiz
    // Переменные игры
    this.questions = quiz[this.indexCurrentQuiz]['questions']
    this.questionIndex = 0
    this.userScore = 0
    this.countQuestions = this.questions.length

    // Таймер
    this.amountTimeSeconds = 30
    this.userPassingTime = 0
    this.totalTime = this.amountTimeSeconds * this.countQuestions
    this.countTimeSeconds = this.amountTimeSeconds
    this.countdown
  }

  timerDisplay() {
    quizTimeLeft.innerHTML = `${this.countTimeSeconds}с`
    this.countdown = setInterval(() => {
      this.countTimeSeconds--
      quizTimeLeft.innerHTML = `${this.countTimeSeconds}с`
      if (this.countTimeSeconds == 3) {
        audio.play()
      }
      if (this.countTimeSeconds == 0) {
        this.userPassingTime += this.amountTimeSeconds - parseInt(quizTimeLeft.textContent)
        this.questionIndex++
        this.renderQuestion()
      }
    }, 1000)
  }

  resetQuizResults() {
    clearInterval(this.countdown)
    this.questionIndex = 0
    this.userScore = 0
    this.userPassingTime = 0

    resultScreenTitle.innerHTML = ''
    resultScreenDescr.innerHTML = ''
    resultScreenTable.innerHTML = ''
    resultScreenListAnswers.innerHTML = ''

    for (let question of this.questions) {
      question['isRightUserAnswer'] = false
      question['userAnswer'] = null
    }
  }

  checkAnswer() {
    const selectedAnswerUser = quizQuestionListAnswers.querySelector('.quiz__item-answer:checked')
    if (!selectedAnswerUser) {
      quizQuestionButtonWrapper.classList.add('error')
      setTimeout(() => {
        quizQuestionButtonWrapper.classList.remove('error')
      }, 2000)
      return false
    }
    quizQuestionButtonWrapper.classList.remove('error')
    this.questions[this.questionIndex]['userAnswer'] = selectedAnswerUser.value
    if (this.questions[this.questionIndex]['correct'] === this.questions[this.questionIndex]['userAnswer']) {
      this.questions[this.questionIndex]['isRightUserAnswer'] = true
      this.userScore++
    }

    this.questionIndex++

    return true
  }

  renderQuestion() {
    // Нажатие кнопки на последнем вопросе
    if (this.questionIndex === this.questions.length) {
      this.renderProgressBar(true)
      changeScreen(quizResultScreen, [quizQuestionContainer]);
      this.renderResult()
      return
    }

    let questionTitleText = this.questions[this.questionIndex]['question']
    let questionImgHTML = `<img src="img/questions/${this.indexCurrentQuiz + 1}/${this.questions[this.questionIndex][
      'numberImg'
    ]}.jpg" alt="${questionTitleText}" width="640" height="480" decoding="async" fetchpriority="high">`

    let questionListAnswersHTML = ``
    this.questions[this.questionIndex]['answers'].forEach((item, i) => {
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

    if (this.questionIndex === this.questions.length - 1) {
      quizButtonQuestion.textContent = 'закончить'
    } else {
      quizButtonQuestion.textContent = 'ответить'
    }

    this.renderProgressBar()

    this.countTimeSeconds = this.amountTimeSeconds
    clearInterval(this.countdown)
    this.timerDisplay()
  }

  renderProgressBar(isLastQuestion = false) {
    if (!isLastQuestion) {
      quizProgressAmountNumber.textContent = this.countQuestions
      quizProgressCurrentNumber.textContent = this.questionIndex + 1
      quizProgressFill.style.width = `${this.questionIndex / this.countQuestions * 100}%`
    } else {
      quizProgressFill.style.width = `${this.questionIndex / this.countQuestions * 100}%`
    }
  }

  randomQuestions() {
    this.questions.sort(() => Math.random() - 0.5)
    for (const q of this.questions) {
      q.answers.sort(() => Math.random() - 0.5)
    }
  }

  renderResult() {
    clearInterval(this.countdown)
    audio.pause()
    audio.currentTime = 0

    const percentRightAnswers = (this.userScore / this.countQuestions * 100).toFixed()

    let raiting = 0
    if (percentRightAnswers > 85) {
      resultScreenDescr.innerHTML = `<span>Сильный результат</span>Вы хорошо знаете тему «${quiz[
        this.indexCurrentQuiz
      ]['nameQuiz']}». Ошибок почти нет, значит даты, фамилии и общий контекст держатся в голове уверенно.`
      resultScreenTitle.innerHTML = `${this.userScore} <span>из</span> ${this.countQuestions}`
      raiting = 5
    } else if (percentRightAnswers > 65) {
      resultScreenDescr.innerHTML = `<span>Хорошо</span>По теме «${quiz[
        this.indexCurrentQuiz
      ]['nameQuiz']}» база есть. Где-то подвели детали, но общая картина понятна.`
      resultScreenTitle.innerHTML = `${this.userScore} <span>из</span> ${this.countQuestions}`
      raiting = 4
    } else if (percentRightAnswers > 45) {
      resultScreenDescr.innerHTML = `<span>Нормально, но есть пробелы</span>Часть вопросов по теме «${quiz[
        this.indexCurrentQuiz
      ][
        'nameQuiz'
      ]}» далась уверенно, но некоторые события и решения стоит повторить.`
      resultScreenTitle.innerHTML = `${this.userScore} <span>из</span> ${this.countQuestions}`
      raiting = 3
    } else if (percentRightAnswers > 1) {
      resultScreenDescr.innerHTML = `<span>Пока слабовато</span>В теме «${quiz[
        this.indexCurrentQuiz
      ][
        'nameQuiz'
      ]}» много путаницы. Посмотрите пояснения ниже, там видно, где именно просели ответы.`
      resultScreenTitle.innerHTML = `${this.userScore} <span>из</span> ${this.countQuestions}`
      raiting = 2
    } else {
      resultScreenDescr.innerHTML = `<span>Нужно повторить тему</span>Похоже, период 1945–1964 пока смешивается в одну кучу. Начните с пояснений к вопросам, а потом пройдите раздел еще раз.`
      resultScreenTitle.innerHTML = `${this.userScore} <span>из</span> ${this.countQuestions}`
      raiting = 1
    }

    function secondsToMinutes(seconds) {
      seconds = Number(seconds)

      let m = Math.floor(seconds % 3600 / 60)
      let s = Math.floor(seconds % 3600 % 60)

      return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2)
    }

    const averageTime = Math.round(this.userPassingTime / this.countQuestions)

    resultScreenTable.innerHTML = `
      <tr>
        <th>Правильные ответы</th>
        <th>${this.userScore} из ${this.countQuestions}</th>
      </tr>
      <tr>
        <td>Процент верных ответов</td>
        <td>${percentRightAnswers}%</td>
      </tr>
      <tr>
        <td>Время</td>
        <td>${secondsToMinutes(this.userPassingTime)} из ${secondsToMinutes(this.totalTime)}</td>
      </tr>
      <tr>
        <td>В среднем на вопрос</td>
        <td>${secondsToMinutes(averageTime)} из ${secondsToMinutes(this.amountTimeSeconds)}</td>
      </tr>
      <tr>
        <td>Оценка</td>
        <td>${raiting}</td>
      </tr>
    `

    resultScreenListAnswers.innerHTML = `<div class="result-question-list__title">Вопросы и ответы</div>`
    this.questions.forEach((question, index) => {
      let questionListAnswersHTML = ''

      let templateAnswerItem = `
        <li class="quiz__item %cssClass%">
          <label>
            <span>%title%</span>
          </label>
        </li>
      `
      // Применение ответам нужные стили
      if (question['isRightUserAnswer']) {
        for (let answer of question['answers']) {
          if (answer !== question['correct']) {
            questionListAnswersHTML += templateAnswerItem.replace('%cssClass%', 'quiz__item_answered').replace('%title%', answer)
          } else {
            questionListAnswersHTML += templateAnswerItem.replace('%cssClass%', 'quiz__item_right').replace('%title%', answer)
          }
        }
      } else {
        for (let answer of question['answers']) {
          if (answer === question['correct']) {
            questionListAnswersHTML += templateAnswerItem.replace('%cssClass%', 'quiz__item_suppose').replace('%title%', answer)
          } else if (answer === question['userAnswer']) {
            questionListAnswersHTML += templateAnswerItem.replace('%cssClass%', 'quiz__item_wrong').replace('%title%', answer)
          } else {
            questionListAnswersHTML += templateAnswerItem.replace('%cssClass%', 'quiz__item_answered').replace('%title%', answer)
          }
        }
      }

      const questionHTML = `
        <div class="result-question-list__item">
          <div class="quiz__question-wrapper">
            <h4 class="quiz__title quiz__title_question main-title">${index + 1}) ${question['question']}</h4>
            <div class="quiz__question">
              <div class="quiz__image">
                <img src="img/questions/${this.indexCurrentQuiz + 1}/${question['numberImg']}.jpg" alt="${question['question']}" width="640" height="480" loading="lazy" decoding="async">
              </div>
              <ul class="quiz__list">
                ${questionListAnswersHTML}
                <div class="result-question-list__answer-descr"><p class="result-question-list__answer-descr-title">Пояснение:</p>${question[
                  'descrAnswer'
                ]}</div>
              </ul>
            </div>
          </div>
        </div>
        `
      resultScreenListAnswers.insertAdjacentHTML('beforeend', questionHTML)
    })
  }

  getHeaderHeightAndMargin() {
    const questionTitle = document.querySelector('.quiz__question-container.visible .quiz__title_question')
    const topOffset = 16

    if (!questionTitle) {
      return 0
    }

    return Math.max(0, questionTitle.getBoundingClientRect().top + window.scrollY - topOffset)
  }

  animateScrollTo() {
    window.scrollTo({
      top: this.getHeaderHeightAndMargin(),
      left: 0,
      behavior: 'smooth'
    })
  }
}

// Cлушатели событий на кнопки (начало игры, следующий вопрос, повтор игры)
quizButtonQuestion.addEventListener('click', function(e) {
  e.preventDefault()
  if (q.checkAnswer()) {
    q.userPassingTime += q.amountTimeSeconds - parseInt(quizTimeLeft.textContent)
    q.renderQuestion()

    // Выключению звука
    audio.pause()
    audio.currentTime = 0
    q.animateScrollTo()
  }
})
quizButtonRestart.addEventListener('click', function(e) {
  e.preventDefault()
  q.resetQuizResults()
  q.randomQuestions()
  q.renderQuestion()
  changeScreen(quizQuestionContainer, [quizResultScreen, quizStartScreen]);
  q.animateScrollTo()
})
quizButtonToStartScreen.addEventListener('click', function(e) {
  e.preventDefault()
  q.resetQuizResults()
  changeScreen(quizStartScreen, [quizResultScreen, quizQuestionContainer]);
  q.animateScrollTo()
})

const quizButtonExit = document.querySelector('.quiz__button_exit');
quizButtonExit.addEventListener('click', function(e) {
  e.preventDefault()
  q.resetQuizResults()
  changeScreen(quizStartScreen, [quizResultScreen, quizQuestionContainer]);
})
