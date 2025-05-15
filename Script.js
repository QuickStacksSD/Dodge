const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let difficultyMultiplier = 1;

const player = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  size: 50,
  speed: 12, // Increased speed here
  draw() {
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size);
    ctx.closePath();
    ctx.fill();
  },
  move(dir) {
    if (dir === "left") this.x -= this.speed;
    else if (dir === "right") this.x += this.speed;

    if (this.x - this.size / 2 < 0) this.x = this.size / 2;
    if (this.x + this.size / 2 > canvas.width) this.x = canvas.width - this.size / 2;
  }
};

let obstacles = [];

function spawnObstacle() {
  const size = 30 + Math.random() * 40;
  const x = Math.random() * (canvas.width - size);
  const speed = (4 + Math.random() * 4) * difficultyMultiplier;
  obstacles.push({ x, y: -size, size, speed });
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => {
    ctx.beginPath();
    ctx.arc(o.x + o.size / 2, o.y + o.size / 2, o.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateObstacles() {
  for (let o of obstacles) {
    o.y += o.speed;

    if (
      o.x < player.x + player.size / 2 &&
      o.x + o.size > player.x - player.size / 2 &&
      o.y < player.y + player.size &&
      o.y + o.size > player.y
    ) {
      gameOver = true;
    }
  }

  obstacles = obstacles.filter(o => o.y < canvas.height);
}

let keys = { left: false, right: false };

function handleInput() {
  if (keys.left) player.move("left");
  if (keys.right) player.move("right");
}

// Touch support
window.addEventListener("pointerdown", e => {
  if (e.clientX < window.innerWidth / 2) {
    keys.left = true;
  } else {
    keys.right = true;
  }
});
window.addEventListener("pointerup", () => {
  keys.left = false;
  keys.right = false;
});

// Keyboard
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handleInput();
  player.draw();
  drawObstacles();
  updateObstacles();

  score += 0.1;
  scoreDisplay.innerText = "Score: " + Math.floor(score);

  // Increase difficulty every 100 points, cap at 6x
  if (Math.floor(score) % 100 === 0) {
    difficultyMultiplier = Math.min(6, 1 + Math.floor(score / 100) * 0.3);
  }
  if (gameOver) {
    const finalScore = Math.floor(score); // your final score variable
  
    // Save score to localStorage
    localStorage.setItem("finalScore", finalScore);
  
    // Redirect to game over page
    window.location.href = "../GameOver.html";
  
    return; // stop the game loop or any further code
  }

  requestAnimationFrame(gameLoop);
}

let spawnInterval = 700;
function updateSpawner() {
  if (!gameOver) {
    spawnObstacle();
    const interval = spawnInterval / difficultyMultiplier;
    setTimeout(updateSpawner, interval);
  }
}

updateSpawner();
gameLoop();

