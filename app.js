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
    quizResultScreen.classList.remove('visible')
    quizQuestionContainer.classList.add('visible')
    quizStartScreen.classList.remove('visible')

    q = new InitQuiz(index)
    if (!arrLoadedImages.includes(index)) {
      document.head.insertAdjacentHTML('beforeend', generateLoadingImageHTML(index, quiz[index]['questions'].length))
    }
    q.resetQuizResults()
    q.randomQuestions()
    q.renderQuestion()
    q.animateScrollTo()

    console.log(`Clicked button ${index}`)
  })
})

class InitQuiz {
  constructor(indexCurrentQuiz) {
    // Переменные игры
    let questions = quiz[indexCurrentQuiz]['questions']
    let questionIndex = 0
    let userScore = 0
    let countQuestions = questions.length

    // Таймер
    this.amountTimeSeconds = 30
    this.userPassingTime = 0
    const totalTime = this.amountTimeSeconds * countQuestions
    let countTimeSeconds = this.amountTimeSeconds
    let countdown

    this.timerDisplay = function() {
      quizTimeLeft.innerHTML = `${countTimeSeconds}с`
      countdown = setInterval(() => {
        countTimeSeconds--
        quizTimeLeft.innerHTML = `${countTimeSeconds}с`
        if (countTimeSeconds == 3) {
          audio.play()
        }
        if (countTimeSeconds == 0) {
          this.userPassingTime += this.amountTimeSeconds - parseInt(quizTimeLeft.textContent)
          questionIndex++
          this.renderQuestion()
        }
      }, 1000)
    }

    this.resetQuizResults = function() {
      questionIndex = 0
      userScore = 0
      this.userPassingTime = 0

      resultScreenTitle.innerHTML = ''
      resultScreenDescr.innerHTML = ''
      resultScreenTable.innerHTML = ''
      resultScreenListAnswers.innerHTML = ''

      for (let question of questions) {
        question['isRightUserAnswer'] = false
        question['userAnswer'] = null
      }
    }

    this.checkAnswer = function() {
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

    this.renderQuestion = function() {
      // Нажатие кнопки на последнем вопросе
      if (questionIndex === questions.length) {
        renderProgressBar(true)
        setTimeout(() => {
          quizQuestionContainer.classList.remove('visible')
          quizResultScreen.classList.add('visible')
          this.renderResult()
        }, 300)
        return
      }

      let questionTitleText = questions[questionIndex]['question']
      let questionImgHTML = `<img src="img/questions/${indexCurrentQuiz + 1}/${questions[questionIndex][
        'numberImg'
      ]}.jpg" alt="${questionTitleText}">`

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

      countTimeSeconds = this.amountTimeSeconds
      clearInterval(countdown)
      this.timerDisplay()
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

    this.randomQuestions = function() {
      questions.sort(() => Math.random() - 0.5)
      for (const q of questions) {
        q.answers.sort(() => Math.random() - 0.5)
      }
    }

    this.renderResult = function() {
      clearInterval(countdown)
      audio.pause()
      audio.currentTime = 0

      const percentRightAnswers = (userScore / countQuestions * 100).toFixed()

      let raiting = 0
      if (percentRightAnswers > 85) {
        resultScreenDescr.innerHTML = `<span>Гений!</span>Ты не просто знаток истории, ты исторический магнат! Твои знания о Советском Союзе в 1945-1953 годах просто ломают шаблоны. Ты знаешь больше, чем сам Иосиф Сталин! Браво!`
        resultScreenTitle.innerHTML = `🎉${userScore} <span>из</span> ${countQuestions}🎉`
        raiting = 5
      } else if (percentRightAnswers > 65) {
        resultScreenDescr.innerHTML = `<span>Отлично!</span>Ты наша историческая сорока, всегда готовая собрать крупицы знаний. Твои познания о Советском Союзе в 1945-1953 годах достойны отметки "хорошо". Продолжай в том же духе и скоро ты станешь легендой научных тусовок!`
        resultScreenTitle.innerHTML = `🎊${userScore} <span>из</span> ${countQuestions}🎊`
        raiting = 4
      } else if (percentRightAnswers > 45) {
        resultScreenDescr.innerHTML = `<span>Не плохо, не катастрофично!</span>Ты оказался лучше, чем большинство. Твои знания о Советском Союзе в 1945-1953 годах несомненно выше среднего, но у тебя всегда есть шанс подтянуться к уровню настоящих исторических гуру. Вперед, в бой за знания!`
        resultScreenTitle.innerHTML = `🥳${userScore} <span>из</span> ${countQuestions}🥳`
        raiting = 3
      } else if (percentRightAnswers > 1) {
        resultScreenDescr.innerHTML = `<span>Потрачено!</span>Ты провалился, как КПСС в 1991 году. Твои знания о Советском Союзе в 1945-1953 годах оставляют желать лучшего. Но не сдавайся! История полна неожиданностей, так что продолжай свое путешествие и возможно, станешь настоящим историческим кумиром!`
        resultScreenTitle.innerHTML = `😭${userScore} <span>из</span> ${countQuestions}😭`
        raiting = 2
      } else {
        resultScreenDescr.innerHTML = `<span>Ой-ой-ой</span>Судя по всему, ты совсем заблудился во временных путях Советского Союза! Но не расстраивайся, история иногда оказывается довольно коварной. Ты можешь пройти викторину еще раз или познакомиться с этим периодом более подробно, чтобы в следующий раз стать историческим гуру! Всегда есть время для нового погружения в прошлое, держись и не сдавайся!`
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
      <td>${secondsToMinutes(this.userPassingTime)} из ${secondsToMinutes(totalTime)}</td>
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
            <img src="img/questions/${indexCurrentQuiz + 1}/${question['numberImg']}.jpg" alt="${question['question']}">
          </div>
          <ul class="quiz__list">${questionListAnswersHTML}</ul>
        </div>
      </div>
    </div>
    `
        resultScreenListAnswers.insertAdjacentHTML('beforeend', questionHTML)
      })
    }

    function getHeaderHeightAndMargin() {
      return document.querySelector('.header').scrollHeight + parseInt(window.getComputedStyle(document.querySelector('.quiz')).marginTop)
    }

    this.animateScrollTo = function() {
      window.scrollTo({
        top: getHeaderHeightAndMargin(),
        left: 0,
        behavior: 'smooth'
      })
    }
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
  quizResultScreen.classList.remove('visible')
  quizQuestionContainer.classList.add('visible')
  quizStartScreen.classList.remove('visible')
  q.animateScrollTo()
})
quizButtonToStartScreen.addEventListener('click', function(e) {
  e.preventDefault()
  q.resetQuizResults()
  quizResultScreen.classList.remove('visible')
  quizQuestionContainer.classList.remove('visible')
  quizStartScreen.classList.add('visible')
  q.animateScrollTo()
})
