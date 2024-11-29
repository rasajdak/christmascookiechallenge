// Get the canvas element and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// global variable
let gameStarted = false; // Track if the game has started
let timer = null; // Tracks the game timer interval


// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Load images
const images = [new Image(), new Image()];
images[0].src = '1.png';
images[1].src = '2.png';

const bgImage = new Image(); // Load background image
bgImage.src = 'bg.jpg';

bgImage.onload = function () {
    showInstructions(); // Display instructions only after the background loads
};

// Load cookie images
const cookieImages = [new Image(), new Image(), new Image()];
cookieImages[0].src = '4.png';
cookieImages[1].src = '5.png';
cookieImages[2].src = '6.png';



// Load audio
const nomSound = new Audio('nom.mp3');
const backgroundMusic = new Audio('music.mp3');
backgroundMusic.loop = true; // Loop the music
backgroundMusic.volume = 0.5; // Set background music volume to 30%

// Track the current image index
let currentImageIndex = 0;

// Event listener to start the game
document.addEventListener('keydown', function (event) {
    if (!gameStarted && event.code === 'Space') {
        console.log("Starting the game...");
        gameStarted = true;
        backgroundMusic.play();
        startTimer();
        gameLoop();
    }
});

function showInstructions() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Display instructions
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';

    // Draw each line of text with proper spacing
    ctx.fillText("Use the arrow keys on your keyboard", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText("to eat as many cookies as you can in 60 seconds!", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Press Spacebar to Start", canvas.width / 2, canvas.height / 2 + 40);
}



// Profile object
const profile = {
    x: canvas.width / 2 - 64, // Center the original size
    y: canvas.height / 2 - 64, // Center the original size
    width: 128, // Original size restored
    height: 128, // Original size restored
    speed: 12.5, // Increased speed
    direction: 'right', // Initial direction
    draw: function () {
        ctx.save();
        if (this.direction === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(images[currentImageIndex], -this.x - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(images[currentImageIndex], this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    },
    move: function (direction) {
        switch (direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                this.direction = 'left';
                break;
            case 'right':
                this.x += this.speed;
                this.direction = 'right';
                break;
        }
        // Cycle the image index
        currentImageIndex = (currentImageIndex + 1) % images.length;

        // Play the nom sound on movement
        nomSound.play();
    }
};

// Randomly place cookies and assign random velocities
let cookies = cookieImages.map(() => ({
    x: Math.random() * (canvas.width - 64), // Adjusted for larger cookies
    y: Math.random() * (canvas.height - 64), // Adjusted for larger cookies
    size: 64, // Increased by 100%
    dx: ((Math.random() * 4 + 1) / 2) * (Math.random() < 0.5 ? 1 : -1), // Slowed by 50%
    dy: ((Math.random() * 4 + 1) / 2) * (Math.random() < 0.5 ? 1 : -1)  // Slowed by 50%
}));

// Track score
let score = 0;

// Countdown timer
let timeRemaining = 60;

// Event listener for keydown
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowUp':
            profile.move('up');
            break;
        case 'ArrowDown':
            profile.move('down');
            break;
        case 'ArrowLeft':
            profile.move('left');
            break;
        case 'ArrowRight':
            profile.move('right');
            break;
    }

    // Check if profile "eats" a cookie
    cookies.forEach(cookie => {
        if (
            profile.x < cookie.x + cookie.size &&
            profile.x + profile.width > cookie.x &&
            profile.y < cookie.y + cookie.size &&
            profile.y + profile.height > cookie.y
        ) {
            // Increment score
            score++;

            // Reposition cookie
            cookie.x = Math.random() * (canvas.width - 32);
            cookie.y = Math.random() * (canvas.height - 32);
        }
    });
});

function endGame() {
    console.log("EndGame function triggered"); // Debugging log

    // Stop the game loop
    gameStarted = false;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Canvas cleared");

    // Draw the background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    console.log("Background drawn");

    // Display final score
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText('Your Score: ' + score, canvas.width / 2, canvas.height / 2);
    console.log("Final score displayed");

    // Display restart message
    ctx.font = '24px Arial';
    ctx.fillText('Press Spacebar to Restart', canvas.width / 2, canvas.height / 2 + 50);
    console.log("Restart message displayed");

    // Add restart listener
    document.addEventListener('keydown', restartGame, { once: true });
    console.log("Restart listener added");

    // Force a canvas update
    requestAnimationFrame(() => {});
}





function restartGame(event) {
    if (event.code === 'Space') {
        console.log("Restarting the game..."); // Debugging log

        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
            timer = null; // Reset timer
        }

        // Reset game variables
        gameStarted = false; // This will be toggled to true later
        score = 0;
        timeRemaining = 60; // Reset the timer

        // Restart background music
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();

        // Show instructions or directly start the game
        showInstructions();

        // Start the timer and game loop
        gameStarted = true; // Now toggle gameStarted to true
        startTimer();
        gameLoop();
    }
}





function gameLoop() {
    if (!gameStarted) return; // Stop the loop if the game has ended

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Draw profile
    profile.draw();

    // Move and draw cookies
    cookies.forEach(cookie => {
        cookie.x += cookie.dx;
        cookie.y += cookie.dy;

        if (cookie.x < 0 || cookie.x + cookie.size > canvas.width) cookie.dx *= -1;
        if (cookie.y < 0 || cookie.y + cookie.size > canvas.height) cookie.dy *= -1;

        ctx.drawImage(cookieImages[cookies.indexOf(cookie)], cookie.x, cookie.y, cookie.size, cookie.size);
    });

    // Draw score (left-aligned)
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left'; // Align text to the left
    ctx.fillText('Score: ' + score, 10, 20); // Positioned near the left edge

    // Draw timer (right-aligned)
    ctx.textAlign = 'right'; // Align text to the right
    ctx.fillText('Time: ' + timeRemaining + 's', canvas.width - 10, 20); // Positioned near the right edge

    requestAnimationFrame(gameLoop);
}




function startTimer() {
    console.log("Starting the timer..."); // Debugging log

    // Clear any existing timer to avoid duplicates
    if (timer) {
        clearInterval(timer);
    }

    // Start a new timer
    timer = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timer);
            timer = null; // Reset the timer variable
            backgroundMusic.pause(); // Stop background music
            console.log("Game Over: Triggering endGame"); // Debugging log
            endGame(); // Trigger game-over screen
        } else {
            timeRemaining--;
            console.log("Time Remaining:", timeRemaining); // Debugging log
        }
    }, 1000);
}



// Start the game loop and timer once all images are loaded
let imagesLoaded = 0;
[...images, ...cookieImages, bgImage].forEach(image => {
    image.onload = function () {
        imagesLoaded++;
        if (imagesLoaded === images.length + cookieImages.length + 1) {
            showInstructions(); // Show instructions after all assets load
        }
    };
    image.onerror = function () {
        console.error('Failed to load image:', image.src);
    };
});
