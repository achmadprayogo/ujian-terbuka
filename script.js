import { userNames, userQuestions } from "./data.js";
let users = userNames;
let questions = userQuestions;

let randomizing = false;
let userInterval = null;
let questionInterval = null;
let currentUserIndex = 0;
let currentQuestionIndex = 0;
let user = {};
let question = {};
const randomizeContainer = document.getElementById("randomize-container");
const questionContainer = document.getElementById("question-container");
const deleteButton = document.getElementById("delete-btn");

// Add a new audio element for the stop sound
const slotAudio = new Audio(
  "src/sounds/mixkit-slot-machine-payout-alarm-1996.wav"
);
const stopAudio = new Audio("src/sounds/mixkit-arcade-bonus-alert-767.wav");

// Add delete button dynamically after stop
function addOpenQuestionButton() {
  if (!document.getElementById("open-btn")) {
    const btn = document.createElement("button");
    btn.id = "open-btn";
    btn.textContent = "Buka Soal";
    btn.style.marginLeft = "12px";
    btn.onclick = handleOpenQuestion; //handleDelete;
    document.querySelector(".buttons").appendChild(btn);
  }
}

// Remove delete button
function removeOpenQuestionButton() {
  const btn = document.getElementById("open-btn");
  if (btn) btn.remove();
}

// Utility to clear previous picks and selection style
function clearPicks() {
  const userLis = document.querySelectorAll("#user-numbers li");
  const questionLis = document.querySelectorAll("#question-numbers li");
  userLis.forEach((li) => {
    const picked = li.querySelector(".picked-user");
    if (picked) picked.textContent = "";
    li.classList.remove("selected");
  });
  questionLis.forEach((li) => {
    const picked = li.querySelector(".picked-question");
    if (picked) picked.textContent = "";
    li.classList.remove("selected");
  });
}

// Utility to update lists in UI after deletion or for initial creation
function updateLists() {
  // Update users
  let userUl = document.getElementById("user-numbers");
  userUl.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = `<span class="number">${users[i].number}</span><span class="picked-user"></span>`;
    userUl.appendChild(li);
    li.querySelector(".picked-user").textContent = users[i].name;
  }

  // Update questions
  let qUl = document.getElementById("question-numbers");
  qUl.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = `<span class="number">${questions[i].number}</span>`;
    qUl.appendChild(li);
    // li.querySelector(".picked-question").textContent = questions[i].question;
  }
}

// Utility to show the current rolling pick, with selection style
function highlightCurrent(userIdx, questionIdx) {
  clearPicks();
  // Highlight user
  const userLis = document.querySelectorAll("#user-numbers li");
  if (users.length) {
    if (userLis[userIdx]) {
      userLis[userIdx].classList.add("selected");
      userLis[userIdx].querySelector(".picked-user").textContent =
        users[userIdx].name;
    }
  }
  // Highlight question
  const questionLis = document.querySelectorAll("#question-numbers li");
  if (questions.length) {
    if (questionLis[questionIdx]) {
      questionLis[questionIdx].classList.add("selected");
      //   questionLis[questionIdx].querySelector(".picked-question").textContent =
      //     questions[questionIdx].question;
    }
  }
}

// Utility to show the final pick under the number, with green border
function showFinal(userIdx, questionIdx) {
  clearPicks();
  const userLis = document.querySelectorAll("#user-numbers li");
  const questionLis = document.querySelectorAll("#question-numbers li");

  // Pastikan index valid dan elemen ada
  if (userIdx >= 0 && userIdx < userLis.length) {
    userLis[userIdx].classList.add("selected");
    if (users[userIdx]) {
      userLis[userIdx].querySelector(".picked-user").textContent =
        users[userIdx].name;
    }
  }

  if (questionIdx >= 0 && questionIdx < questionLis.length) {
    questionLis[questionIdx].classList.add("selected");
  }
  //   document.getElementById("final-user").textContent = users[userIdx] || "-";
  //   document.getElementById("final-question").textContent =
  //     questions[questionIdx] || "-";
}

document.getElementById("randomize-btn").addEventListener("click", function () {
  if (randomizing) return;
  if (users.length === 0 || questions.length === 0) {
    alert("No more users or questions to select.");
    return;
  }

  randomizing = true;
  document.getElementById("randomize-btn").disabled = true;
  document.getElementById("stop-btn").disabled = false;
  //   document.getElementById("final-user").textContent = "-";
  //   document.getElementById("final-question").textContent = "-";
  clearPicks();
  removeOpenQuestionButton();

  // Play slot machine sound
  slotAudio.currentTime = 0;
  slotAudio.loop = true;
  slotAudio.play();

  userInterval = setInterval(() => {
    currentUserIndex = Math.floor(Math.random() * users.length);
    user = users[currentUserIndex];
    // Immediately sync question with user
    question = questions.find((item) => item.id === user.id);
    currentQuestionIndex = questions.indexOf(question);
    highlightCurrent(currentUserIndex, currentQuestionIndex);
  }, 80);

  //   questionInterval = setInterval(() => {
  //     question = questions.find((item) => item.id === user.id);
  //     currentQuestionIndex = questions.indexOf(question); //Math.floor(Math.random() * questions.length);
  //     highlightCurrent(currentUserIndex, currentQuestionIndex);
  //   }, 90);
});

document.getElementById("stop-btn").addEventListener("click", function () {
  if (!randomizing) return;

  randomizing = false;
  document.getElementById("randomize-btn").disabled = false;
  document.getElementById("stop-btn").disabled = true;

  clearInterval(userInterval);
  clearInterval(questionInterval);

  // Stop the slot sound
  slotAudio.pause();
  slotAudio.currentTime = 0;

  // Play stop ("bonus alert") sound
  stopAudio.currentTime = 0;
  stopAudio.play();

  //   console.log(user.id, question.id);
  //   console.log("indx", currentUserIndex, currentQuestionIndex);
  //   console.log(user, question);
  showFinal(currentUserIndex, currentQuestionIndex);
  setQuestion(question);

  addOpenQuestionButton();
});

function setQuestion(question) {
  const questionNumber = document.getElementById("question-number");
  const questionTitle = document.getElementById("question-title");
  const arabicText = document.getElementById("arabic-text");
  const alphabetText = document.getElementById("aphabet-text");

  questionNumber.textContent = `Soal Nomor: ${question.number}`;
  questionTitle.textContent = question.title;
  arabicText.textContent = question.question;
  alphabetText.textContent = question.translate;
}

function handleOpenQuestion() {
  // Check if elements exist
  if (!randomizeContainer || !questionContainer) {
    console.error("Required containers not found in the DOM");
    return;
  }

  deleteButton.onclick = handleDelete;

  // Toggle visibility between containers
  randomizeContainer.classList.remove("visible");
  randomizeContainer.classList.add("hidden");

  questionContainer.classList.remove("hidden");
  questionContainer.classList.add("visible");
}

function handleDelete() {
  // Remove selected user and question from the arrays
  users.splice(currentUserIndex, 1);
  questions.splice(currentQuestionIndex, 1);

  // Refresh lists in UI
  updateLists();

  // Reset indexes if array is not empty
  if (users.length > 0) currentUserIndex = 0;
  if (questions.length > 0) currentQuestionIndex = 0;

  randomizeContainer.classList.remove("hidden");
  randomizeContainer.classList.add("visible");

  questionContainer.classList.remove("visible");
  questionContainer.classList.add("hidden");

  //   document.getElementById("final-user").textContent = "-";
  //   document.getElementById("final-question").textContent = "-";

  removeOpenQuestionButton();
}

// Initial display
updateLists();
// document.getElementById("final-user").textContent = "-";
// document.getElementById("final-question").textContent = "-";
