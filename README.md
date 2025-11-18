# Instructions for setup

# FrontEnd

## Step 1

    Clone the Angular Project From GitHub
    Go to your GitHub repository → Click Code → Copy the HTTPS URL.


## Step 2

    Install Dependencies

    Angular projects require node_modules.
    Install them using:

    npm install


    This will download all dependencies from package.json.

## Core Dependencies (CodeMirror & Yjs)

The following dependencies were used to build the collaborative editor component:

    ## Dependency                                                                
    1. npm i codemirror @codemirror/lang-javascript 
    2. npm i codemirror @codemirror/autocomplete    
    3. npm i codemirror @codemirror/basic-setup     
    4. npm i yjs y-websocket y-codemirror.next   

## Step 3
    ## Configure Backend URLs
    Inside ai.ts 

# Backend

    1. Prerequisites

    You must have the following software installed on your system:

    Node.js and npm: (Node.js version 18 or higher is recommended).

    Google Gemini API Key: You need a Gemini API key.

    2. Install Dependencies

    Install all the required packages listed in the import statements of your code:

    npm install express dotenv ws yjs y-websocket @google/genai

    3. Run the Application

    cd public
    node server.js

# Gemini API Details

    Navigate to Google Cloud Account -> Enabled Apis & Services -> Credentials.

    Create a New Key: Click the "Create API key" button. If this is your first time, you may need to accept the Terms of Service.

    Copy the Key: A unique, long string will be generated

# Architecture of backend,front end and gemini api interact

  1. When the user types in the CodeMirror editor, it automatically checks whether autocomplete suggestions should appear.

  2. At that time, your custom autocompletion override function runs and collects the full editor text along with the current cursor position.

  3. These values are sent to the backend through this.ai.getCompletion(doc, offset), where the backend processes models.generateContent method and generates intelligent code suggestions.

  4. The backend Gemini API, fetches the result, and sends back a JSON response with suggestion labels and texts, and the Angular code converts them into the format CodeMirror understands (label, type, apply).

  5. CodeMirror then shows these suggestions in a dropdown, and when the user selects one, it gets inserted into the editor, completing the AI-based auto-suggestion flow.

# Prompt Engineering

    The AI code completion feature is powered by the Gemini 2.5 Flash model and uses a technique called prompt engineering to ensure suggestions are relevant, concise, and clean.

    Secure Backend Proxy: All calls to the Gemini API are proxied through the backend to securely protect the API key.

    Strict Formatting Rules: The prompt is engineered with strict rules to enforce the model's output format, ensuring:
        Raw Code Output: The model is instructed to ONLY return the raw code continuation, with no markdown formatting (e.g., no ``` blocks).

        Conciseness: It is explicitly told to provide the "single most likely and relevant continuation," keeping the output brief and functional.

        Contextual Logic: It is guided to complete partial expressions (e.g., if the snippet ends with a + , it should provide the next logical token like b;).

    Optimized Configuration: The API call uses a very low temperature (0.2) to minimize creativity and maximize the likelihood of correct, conventional code suggestions.

# Explanation of Gemini response and display as code completion

  The backend Gemini API, fetches the result, and sends back a JSON response with suggestion labels and texts, and the Angular code converts them into the format CodeMirror understands (label, type, apply).

  CodeMirror then shows these suggestions in a dropdown, and when the user selects one, it gets inserted into the editor, completing the AI-based auto-suggestion flow

# Instructions to test both real-time collaborative features

    1. User 1

    Opens your Angular app

    Enters room ID → roomABC

    Goes to /scren2?room=roomABC

    Starts typing code

    ________________________________________

    2. User 2

    Opens same app

    Enters same room → roomABC

    Comes to the same editor

    Sees what User 1 is typing

    Their cursor/typing also syncs to User 1

    ________________________________________

    ## Result: Real-Time Collaboration Works

    ✔ Text syncs

    ✔ Cursors sync

    ✔ AI suggestions appear

    ✔ Multiple users edit same document

    ________________________________________

    ## IMPORTANT — Your WebSocket Server Must Be Running

    You must run YJS Websocket server:

    npx y-websocket-server --port 1234