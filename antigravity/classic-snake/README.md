# Classic Snake

A minimal, grid-based Classic Snake game built using vanilla HTML5 Canvas, CSS, and JS. 

## Run Instructions

Since this is a lightweight vanilla web project without dependencies, you can serve it via any basic HTTP server. As requested, here are the instructions using Python/`uv`:

1. Open your terminal and navigate to the project directory:
   ```bash
   cd path/to/evaluations/first-contact
   ```
2. Start the local development server using `uv` (or standard `python`):
   ```bash
   uv run python -m http.server 8000
   # OR standard Python:
   python -m http.server 8000
   ```
3. Open your web browser and navigate to:
   http://localhost:8000

## Manual Verification Checklist

Please verify the following mechanics once the game is running:

- [ ] **Movement & Controls**: The snake responds to Arrow keys and WASD keys cleanly without reversing into itself instantly.
- [ ] **Boundaries (Game Over)**: Driving the snake into the 4 walls of the canvas triggers the Game Over screen.
- [ ] **Self-Collision (Game Over)**: The snake dies when running its head into its own body.
- [ ] **Food & Growth**: Eating the red food block increments the score by 10, spawns a new food block, and accurately increases the snake's tail length by 1 segment.
- [ ] **Pause / Resume**: Pressing the `Spacebar` while playing brings up the Paused overlay. Pressing `Spacebar` again resumes gameplay seamlessly. 
- [ ] **Restart**: Clicking "Play Again" on the Game Over screen successfully resets the game state (score 0, initial tail length, initial position).
