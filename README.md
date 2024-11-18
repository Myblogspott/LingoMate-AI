# LingoMate-AI

LingoMate-AI is a generative AI-driven multilingual chatbot that can respond intelligently based on your website content. It supports interactions in Hindi, English, or a blend of both, and seamlessly transitions to a human agent when needed.

## Project Setup

Follow the steps below to set up the project on your local system.

### Prerequisites

- **Python**: Ensure you have Python 3.8+ installed.
- **Node.js**: Required for running the custom-chatbot server.
- **pip**: Python package installer (should come with Python).

### Step-by-Step Installation Guide

#### 1. Clone the Repository

```bash
git clone https://github.com/YourUsername/LingoMate-AI.git
cd LingoMate-AI
```

Replace `YourUsername` with your actual GitHub username.

---

### 2. Setting Up the Python Environment

#### For Windows:

1. Open the Command Prompt.
2. Navigate to the project directory.
3. Create a virtual environment:
   ```bash
   python -m venv chatbot_env
   ```
4. Activate the virtual environment:
   ```bash
   chatbot_env\Scripts\activate
   ```
5. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

#### For Mac (Intel and M1/M2 Silicon Chips):

1. Open Terminal.
2. Navigate to the project directory.
3. Create a virtual environment:
   ```bash
   python3 -m venv chatbot_env
   ```
4. Activate the virtual environment:
   ```bash
   source chatbot_env/bin/activate
   ```
5. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

> **Note for Mac M1/M2 Users**: If you encounter issues with dependency installations, ensure you have Rosetta installed and run your Terminal using Rosetta, or use Python environments compatible with your architecture.

---

### 3. Setting Up the Node.js Server

1. Navigate to the `custom-chatbot` directory:
   ```bash
   cd custom-chatbot
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```

---

### 4. Running the Project

#### Step 1: Start the Python Backend

In the project root directory, ensure your virtual environment is activated, then run:

```bash
python app.py
```

#### Step 2: Start the Node.js Chatbot Server

Navigate to the `custom-chatbot` directory and run:

```bash
node index.js
```

---

### 5. Accessing the Chatbot

- **Chatbot UI**: Open your browser and go to `http://localhost:3000` to interact with the chatbot.
- **Agent Dashboard**: Open your browser and go to `http://localhost:3000/agent` for the agent interface.

---

## Additional Notes

- Ensure both Python and Node.js servers are running simultaneously for full functionality.
- Modify configuration files as needed to connect to your specific website content API.

---

### Troubleshooting

- **Dependency Issues**: Make sure all dependencies are correctly installed and compatible with your OS.
- **Virtual Environment Activation**: Double-check that your virtual environment is activated before installing dependencies or running the Python server.
- **Mac M1/M2 Users**: If using `brew`, ensure your installed packages are configured for your chip architecture.

---

Happy Chatting with LingoMate-AI! 🚀
