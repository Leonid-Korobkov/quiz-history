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

const audio = document.getElementsByTagName('audio')[0]

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
  quiz.forEach(item => {
    const itemHTML = `
    <div class="select-quiz__item">
      <div class="select-quiz__title">${item.nameQuiz}</div>
      <div class="select-quiz__button-wrapper">
        <button type="button" class="quiz__button quiz__button_select-quiz">пройти</button>
      </div>
    </div>
    `
    quizSelectQuizList.insertAdjacentHTML('beforeend', itemHTML)
  })
}
renderQuizItemsOnStartScreen()

const quizButtonsStart = document.querySelectorAll('.quiz__button_select-quiz')

let arrLoadedImages = []
function generateLoadingImageHTML(numberQuiz, countQuestions) {
  let listHTML = ``
  for (let i = 0; i < countQuestions; i++) {
    listHTML += `<link rel="preload" as="image" href="img/questions/${numberQuiz + 1}/${i + 1}.jpg">`
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
    ]}.jpg" alt="${questionTitleText}">`

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
      resultScreenDescr.innerHTML = `<span>Гений!</span>Ты не просто знаток истории, ты исторический магнат! Твои знания в теме «${quiz[
        this.indexCurrentQuiz
      ]['nameQuiz']}» просто ломают шаблоны. Ты знаешь больше, чем сам Иосиф Сталин! Браво!`
      resultScreenTitle.innerHTML = `🎉${this.userScore} <span>из</span> ${this.countQuestions}🎉`
      raiting = 5
    } else if (percentRightAnswers > 65) {
      resultScreenDescr.innerHTML = `<span>Отлично!</span>Ты наша историческая сорока, всегда готовая собрать крупицы знаний. Твои познания в теме «${quiz[
        this.indexCurrentQuiz
      ]['nameQuiz']}» достойны отметки "хорошо". Продолжай в том же духе и скоро ты станешь легендой научных тусовок!`
      resultScreenTitle.innerHTML = `🎊${this.userScore} <span>из</span> ${this.countQuestions}🎊`
      raiting = 4
    } else if (percentRightAnswers > 45) {
      resultScreenDescr.innerHTML = `<span>Не плохо, не катастрофично!</span>Ты оказался лучше, чем большинство. Твои знания в теме «${quiz[
        this.indexCurrentQuiz
      ][
        'nameQuiz'
      ]}» несомненно выше среднего, но у тебя всегда есть шанс подтянуться к уровню настоящих исторических гуру. Вперед, в бой за знания!`
      resultScreenTitle.innerHTML = `🥳${this.userScore} <span>из</span> ${this.countQuestions}🥳`
      raiting = 3
    } else if (percentRightAnswers > 1) {
      resultScreenDescr.innerHTML = `<span>Потрачено!</span>Ты провалился, как КПСС в 1991 году. Твои знания в теме «${quiz[
        this.indexCurrentQuiz
      ][
        'nameQuiz'
      ]}» оставляют желать лучшего. Но не сдавайся! История полна неожиданностей, так что продолжай свое путешествие и возможно, станешь настоящим историческим кумиром!`
      resultScreenTitle.innerHTML = `😭${this.userScore} <span>из</span> ${this.countQuestions}😭`
      raiting = 2
    } else {
      resultScreenDescr.innerHTML = `<span>Ой-ой-ой</span>Судя по всему, ты совсем заблудился во временных путях Советского Союза! Но не расстраивайся, история иногда оказывается довольно коварной. Ты можешь пройти викторину еще раз или познакомиться с этим периодом более подробно, чтобы в следующий раз стать историческим гуру! Всегда есть время для нового погружения в прошлое, держись и не сдавайся!`
      resultScreenTitle.innerHTML = `🤬🤯${this.userScore} <span>из</span> ${this.countQuestions}🤯🤬`
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
        <th>Количестов правильных ответов</th>
        <th>${this.userScore} из ${this.countQuestions}</th>
      </tr>
      <tr>
        <td>Процент правильных ответов</td>
        <td>${percentRightAnswers}%</td>
      </tr>
      <tr>
        <td>Время прохождения</td>
        <td>${secondsToMinutes(this.userPassingTime)} из ${secondsToMinutes(this.totalTime)}</td>
      </tr>
      <tr>
        <td>Среднее время на вопрос</td>
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
                <img src="img/questions/${this.indexCurrentQuiz + 1}/${question['numberImg']}.jpg" alt="${question['question']}">
              </div>
              <ul class="quiz__list">
                ${questionListAnswersHTML}
                <div class="result-question-list__answer-descr"><p style="font-size: 20px;color: var(--dark-main-color);">Пояснение:</p>${question[
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
    return document.querySelector('.header').scrollHeight + parseInt(window.getComputedStyle(document.querySelector('.quiz')).marginTop)
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
