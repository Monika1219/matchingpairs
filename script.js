// Melody's Matching Pairs - script.js
const groups = {
  animals: ['🐶','🐱','🐭','🐰','🐨','🦄'], // unicorn included
  sweets: ['🍭','🍬','🧁','🍰','🍫','🍩'],
  food: ['🍕','🍔','🌮','🍣','🍜','🍎'],
  colours: ['🔴','🟠','🟡','🟢','🔵','🟣']
};

const TIMER_START = 90; // seconds

const boardEl = document.getElementById('board');
const groupSelect = document.getElementById('group');
const startBtn = document.getElementById('startBtn');
const timerEl = document.getElementById('timer');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMsg = document.getElementById('overlayMsg');
const retryBtn = document.getElementById('retryBtn');
const rainbow = document.getElementById('rainbow');

let timer = TIMER_START;
let intervalId = null;
let firstCard = null;
let secondCard = null;
let lock = false;
let matchedCount = 0;
let started = false;

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

function buildDeck(theme){
  console.log('Building deck for theme:', theme);
  const items = groups[theme].slice(0,6);
  const deck = shuffle([...items, ...items]);
  boardEl.innerHTML='';
  deck.forEach((icon, idx)=>{
    const card = document.createElement('div');
    card.className='card';
    card.dataset.icon = icon;
    card.dataset.index = idx;
    card.setAttribute('role','button');
    card.setAttribute('aria-label','Card ' + icon);
    card.innerHTML = `
      <div class="card-inner">
        <div class="face back"></div>
        <div class="face front">${icon}</div>
      </div>`;
    card.addEventListener('click', function(e) {
      if(!started) {
        console.log('Game not started, click Start first');
        return;
      }
      onCardClick(e);
    });
    boardEl.appendChild(card);
  });
}

function onCardClick(e) {
  const card = e.currentTarget;
  if(!started) return;
  if(lock) return;
  if(card.classList.contains('matched')) return;
  if(card === firstCard) return;
  if(card.classList.contains('flipped')) return;

  flipCard(card);

  if(!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lock = true;
  setTimeout(() => {
    checkMatch();
  }, 700); // Wait for animation before checking
}

function flipCard(card){
  console.log('Flipping card:', card.dataset.icon);
  card.classList.add('flipped');
}

function unflip(card){
  console.log('Unflipping card:', card.dataset.icon);
  card.classList.remove('flipped');
}

function checkMatch(){
    const a = firstCard.dataset.icon;
    const b = secondCard.dataset.icon;
  if(a === b) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.classList.add('flipped');
    secondCard.classList.add('flipped');
    matchedCount += 2;
    resetTurn();
    if(matchedCount === 12) winGame();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 700);
  }
}

function resetTurn(){
  firstCard = null; secondCard = null; lock = false;
}

function startTimer(){
  // Ensure no previous timer is running
  stopTimer();
  // Start countdown from current timer value (or reset if needed)
  if (!timer || timer <= 0) timer = TIMER_START;
  timerEl.textContent = timer;
  intervalId = setInterval(()=>{
    timer -= 1; timerEl.textContent = timer;
    if(timer <= 0){
      stopTimer();
      loseGame();
    }
  },1000);
}

function stopTimer(){
  if(intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startGame(){
  // Start the timer and allow clicks. Does NOT rebuild the board.
  // Reset timer to full when starting a new game
  stopTimer();
  timer = TIMER_START;
  timerEl.textContent = timer;
  startTimer();
  // allow card interaction
  started = true;
}

// Prepare a new round (build deck, reset UI) but do NOT start the timer
function newRound(theme){
  matchedCount = 0;
  firstCard = null;
  secondCard = null;
  lock = false;
  started = false;
  // stop any running timer
  stopTimer();
  // build the deck but do not enable clicking until Start
  buildDeck(theme);
  // Reset card classes
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.remove('flipped','matched'));
  // hide overlays
  overlay.classList.add('hidden');
  rainbow.classList.add('hidden');
  // reset timer display
  timer = TIMER_START;
  timerEl.textContent = timer;
}

function winGame(){
  // stop any running timer and prevent further clicks
  stopTimer();
  // freeze timer display at current value (or zero)
  if (timer < 0) timer = 0;
  timerEl.textContent = timer;
  // show celebratory overlay
  const emojiEl = document.getElementById('overlayEmoji');
  if(emojiEl) emojiEl.textContent = '🎉';
  overlayTitle.textContent = 'Great job!';
  overlayMsg.textContent = 'You matched all the pairs — fantastic!';
  overlay.classList.remove('hidden');
  overlay.classList.remove('lose');
  overlay.classList.add('win');
  // show rainbow/confetti
  if(rainbow) rainbow.classList.remove('hidden');
  started = false;
}

function loseGame(){
  // stop timer and show overlay
  stopTimer();
  const emojiEl = document.getElementById('overlayEmoji');
  if(emojiEl) emojiEl.textContent = '😢';
  overlayTitle.textContent = 'Time’s up!';
  overlayMsg.textContent = 'You ran out of time — give it another try!';
  overlay.classList.remove('hidden');
  overlay.classList.remove('win');
  overlay.classList.add('lose');
  if(rainbow) rainbow.classList.add('hidden');
  started = false;
}

startBtn.addEventListener('click', ()=>{
  startGame();
});

retryBtn.addEventListener('click', ()=>{
  // Reset board for the current theme but do NOT start timer automatically
  newRound(groupSelect.value);
});

groupSelect.addEventListener('change', ()=>{
  // When user switches theme, prepare a new deck but do NOT start the timer.
  stopTimer();
  newRound(groupSelect.value);
});

// prepare initial round on load (do not start timer until Start clicked)
newRound(groupSelect.value);
timerEl.textContent = TIMER_START;
