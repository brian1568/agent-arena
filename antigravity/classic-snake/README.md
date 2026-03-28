# Classic Snake + RL AI 🐍🤖

A minimal, grid-based Classic Snake game built initially with vanilla HTML5 Canvas/JS, and later upgraded to support **Autonomous AI Play** using Deep Q-Learning (PyTorch) and a Python backend.

## Quick Start (Play AI or Manual)

Because the project now utilizes a Machine Learning backend to drive the "Autoplay" feature, you must run it via the Python environment rather than a basic static file server.

1. **Install Dependencies** (uses `uv` for speed, but `pip` works too):
   ```bash
   uv venv
   . .venv/Scripts/activate  # On Windows PowerShell
   uv pip install -r requirements.txt
   ```

2. **Start the Game Server**:
   ```bash
   uvicorn server:app --port 8080
   ```

3. **Play!**
   Open your browser to [http://localhost:8080](http://localhost:8080).
   - Use `Arrow Keys` or `WASD` to play manually.
   - Click the **"Toggle AI Mode"** button at the bottom to let the PyTorch neural network take the wheel!

---

## Technical Details

### 🧪 Test-Driven Development (TDD)
Before the AI was written, the entire Snake rule-set was cloned into headless Python and strictly vetted. To run the test suite and verify game constraints (boundaries, self-collision, food growth):
```bash
pytest -v test_snake_env.py
```

### 🧠 How the AI Works (Training vs Inference)

The AI driving the snake is built using **Deep Q-Learning** (a type of Reinforcement Learning) via PyTorch. 

**1. Is it learning while I watch it play?**
No. When you click "Toggle AI Mode" in your browser, the model is strictly in **Inference Mode**. The JavaScript game continuously sends its current state to the FastAPI backend, which asks the pre-trained neural network (`model/model.pth`) for the best move, and immediately returns it. The weights are *not* updated during web gameplay.

**2. How was it trained? (Offline Headless Training)**
Since training an AI frame-by-frame inside a web browser is incredibly slow, the entire core logic of the Javascript Snake game was rebuilt natively in pure Python (`snake_env.py`). 

Training was a one-time (or "as needed") offline event. By running the training script (`python agent.py`), an agent spawns in a completely headless environment with no sleeps or frame-delays. It plays thousands of games per minute. The AI:
- **Explores**: Takes random moves and often dies quickly.
- **Exploits**: Slowly learns that "eating apples" gives a `+10` reward and "hitting walls" yields a `-10` penalty.
- **Saves**: Every time the AI casually breaks its own high score, it overwrites `model/model.pth` with its newly upgraded "brain".

If you want to make the AI significantly smarter, you can resume its training locally anytime:
```bash
python agent.py
```

## Manual Verification Checklist

- [ ] **Standard Play**: Arrow keys and WASD still function properly when AI Mode is Off.
- [ ] **Pause/Resume**: Pressing `Spacebar` pauses the game cleanly.
- [ ] **AI Inference**: Clicking "Toggle AI Mode" causes the Javascript client to drop keyboard inputs and fetch `/predict`.
- [ ] **Python TDD**: Running `pytest` successfully passes all core collision and boundary constraints natively in Python.
