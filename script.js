const baseSymbols = ['🤖', '👽', '👾', '🚀', '🛸', '⚡', '💻', '🔮'];
        let cardsData = [];
        
        // Game State Variables
        let moves = 0;
        let matchedPairs = 0;
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard = null;
        let secondCard = null;

        // DOM Elements
        const boardEl = document.getElementById('board');
        const movesEl = document.getElementById('moves-count');
        const bestScoreEl = document.getElementById('best-score');
        const restartBtn = document.getElementById('restart-btn');
        const modal = document.getElementById('victory-modal');
        const finalMovesEl = document.getElementById('final-moves');
        const recordBanner = document.getElementById('record-banner');
        const playAgainBtn = document.getElementById('play-again-btn');

        // Load Best Score from LocalStorage
        let bestScore = localStorage.getItem('neonMatchBestScore');
        if (bestScore) {
            bestScoreEl.innerText = bestScore;
        }

        function initGame() {
            // Reset UI and State
            moves = 0;
            matchedPairs = 0;
            movesEl.innerText = moves;
            hasFlippedCard = false;
            lockBoard = false;
            firstCard = null;
            secondCard = null;
            modal.classList.remove('active');
            recordBanner.style.display = 'none';
            boardEl.innerHTML = '';
            stopConfetti();

            // Prepare Cards (Duplicate and Shuffle)
            cardsData = [...baseSymbols, ...baseSymbols];
            cardsData.sort(() => Math.random() - 0.5); // Simple shuffle

            // Render Cards to DOM
            cardsData.forEach((symbol, index) => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.dataset.symbol = symbol;
                
                // card-front is the side showing "?", card-back shows the symbol
                cardElement.innerHTML = `
                    <div class="card-face card-front"></div>
                    <div class="card-face card-back">${symbol}</div>
                `;
                
                // Add event listener directly to the card
                cardElement.addEventListener('click', flipCard);
                boardEl.appendChild(cardElement);
            });
        }

        function flipCard() {
            // Prevent flipping if board is locked, or if clicking the same card twice
            if (lockBoard) return;
            if (this === firstCard) return;
            // Prevent flipping already matched cards
            if (this.classList.contains('matched')) return;

            // Toggle the CSS class that triggers the 180deg 3D rotation
            this.classList.add('flipped');

            if (!hasFlippedCard) {
                // First click
                hasFlippedCard = true;
                firstCard = this;
                return;
            }

            // Second click
            secondCard = this;
            updateMoves();
            checkForMatch();
        }

        function updateMoves() {
            moves++;
            movesEl.innerText = moves;
        }

        function checkForMatch() {
            // Compare dataset values
            let isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

            if (isMatch) {
                disableCards();
            } else {
                unflipCards();
            }
        }

        function disableCards() {
            // It's a match!
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            
            // Remove click events
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);

            matchedPairs++;
            resetBoard();

            // Check for Win
            if (matchedPairs === baseSymbols.length) {
                setTimeout(winGame, 500);
            }
        }

        function unflipCards() {
            // Not a match, lock the board and flip back after delay
            lockBoard = true;

            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000); // 1 second delay so user can see the cards
        }

        function resetBoard() {
            hasFlippedCard = false;
            lockBoard = false;
            firstCard = null;
            secondCard = null;
        }

        function winGame() {
            finalMovesEl.innerText = moves;
            let isNewRecord = false;

            // Handle LocalStorage for Best Score (fewest moves)
            if (!bestScore || moves < parseInt(bestScore)) {
                localStorage.setItem('neonMatchBestScore', moves);
                bestScore = moves;
                bestScoreEl.innerText = bestScore;
                isNewRecord = true;
            }

            if (isNewRecord) {
                recordBanner.style.display = 'block';
            }

            modal.classList.add('active');
            startConfetti();
        }

        // Event Listeners for UI Buttons
        restartBtn.addEventListener('click', initGame);
        playAgainBtn.addEventListener('click', initGame);


        const canvas = document.getElementById('confetti');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function startConfetti() {
            particles = [];
            const colors = ['#0ff', '#f0f', '#39ff14', '#fff'];
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2 + 100,
                    r: Math.random() * 6 + 2,
                    dx: Math.random() * 20 - 10,
                    dy: Math.random() * -15 - 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngle: 0,
                    tiltAngleInc: (Math.random() * 0.07) + 0.05
                });
            }
            animateConfetti();
        }

        function animateConfetti() {
            animationId = requestAnimationFrame(animateConfetti);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, index) => {
                p.tiltAngle += p.tiltAngleInc;
                p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle) * 2;
                p.dy += 0.2; // gravity
                p.x += p.dx;
                p.y += p.dy;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();

                // Remove particle if off screen
                if (p.y > canvas.height) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length === 0) stopConfetti();
        }

        function stopConfetti() {
            if (animationId) cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Initialize game on load
        window.onload = initGame;
