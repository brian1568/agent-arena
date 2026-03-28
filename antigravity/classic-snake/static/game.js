const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const aiToggleBtn = document.getElementById('ai-toggle-btn');

// Game constants
const GRID_SIZE = 20; // 20x20 grid
const TILE_SIZE = canvas.width / GRID_SIZE; // 20px per tile
const TICK_RATE = 125; // Milliseconds per update
const COLORS = {
  snakeHead: '#4CAF50',
  snakeBody: '#81C784',
  food: '#ef5350'
};

// Game state
let snake = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameState = 'init'; // init, playing, paused, gameover
let lastRenderTime = 0;
let aiMode = false;
let aiProcessing = false;
let requestID;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ];
  direction = { x: 0, y: -1 };
  nextDirection = { x: 0, y: -1 };
  score = 0;
  scoreEl.innerText = score;
  gameState = 'playing';
  
  spawnFood();
  gameOverScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  
  if (requestID) cancelAnimationFrame(requestID);
  requestID = requestAnimationFrame(gameLoop);
}

function spawnFood() {
  let isOccupied = true;
  while (isOccupied) {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    // Ensure food doesn't spawn on the snake
    isOccupied = snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function checkCollision(head) {
  // Wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return true;
  }
  // Self collision
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

function update() {
  if (gameState !== 'playing') return;

  if (aiMode && !aiProcessing) {
    aiProcessing = true;
    const snapshot = { snake: [...snake], food: { ...food }, direction: { ...direction } };
    fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    })
      .then(response => response.json())
      .then(data => {
        const move_idx = data.action; // 0=straight, 1=right, 2=left
        const clock_wise = [ {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}, {x:0, y:-1} ];
        let idx = clock_wise.findIndex(d => d.x === direction.x && d.y === direction.y);
        if (idx === -1) idx = 0;
        if (move_idx === 1) nextDirection = clock_wise[(idx + 1) % 4];
        else if (move_idx === 2) nextDirection = clock_wise[(idx + 3) % 4];
        else nextDirection = clock_wise[idx];
      })
      .catch(e => console.error('AI fetch failed', e))
      .finally(() => { aiProcessing = false; });
  }

  direction = nextDirection;
  
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (checkCollision(head)) {
    handleGameOver();
    return;
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.innerText = score;
    spawnFood();
  } else {
    snake.pop(); // Remove tail if no food eaten
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid lines (optional, keep it clean)
  // Draw Food
  ctx.fillStyle = COLORS.food;
  ctx.fillRect(food.x * TILE_SIZE + 1, food.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);

  // Draw Snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;
    ctx.fillRect(segment.x * TILE_SIZE + 1, segment.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  });
}

function gameLoop(currentTime) {
  if (gameState !== 'playing' && gameState !== 'paused') return;

  requestID = requestAnimationFrame(gameLoop);

  const secondsSinceLastRender = currentTime - lastRenderTime;
  if (secondsSinceLastRender < TICK_RATE) return;
  
  lastRenderTime = currentTime;

  if (gameState === 'playing') {
    update();
    draw();
  }
}

function handleGameOver() {
  gameState = 'gameover';
  finalScoreEl.innerText = score;
  gameOverScreen.classList.remove('hidden');
}

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    pauseScreen.classList.remove('hidden');
  } else if (gameState === 'paused') {
    gameState = 'playing';
    pauseScreen.classList.add('hidden');
    lastRenderTime = performance.now(); // Prevent large jump
  }
}

// Input handling
window.addEventListener('keydown', e => {
  // Prevent default scrolling for arrow keys and space
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) > -1) {
    e.preventDefault();
  }

  // Handle pause
  if (e.key === ' ' || e.code === 'Space') {
    if (gameState === 'playing' || gameState === 'paused') {
      togglePause();
    }
    return;
  }

  if (gameState !== 'playing') return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
});

restartBtn.addEventListener('click', () => {
  initGame();
  canvas.focus();
});

aiToggleBtn.addEventListener('click', () => {
  aiMode = !aiMode;
  aiToggleBtn.innerText = `Toggle AI Mode (${aiMode ? 'On' : 'Off'})`;
  aiToggleBtn.style.backgroundColor = aiMode ? '#4CAF50' : '#555';
  canvas.focus();
});

// Start the game initially
initGame();
