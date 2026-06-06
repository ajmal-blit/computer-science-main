document.addEventListener("DOMContentLoaded", () => {
    const queryForm = document.getElementById('query-form');
    const queriesList = document.getElementById('queries-list');

    // 1. Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDz7PWoH4vbObyhYXhXNqi2Cr5uwjBdwJY",
        authDomain: "cs-database-42dd0.firebaseapp.com",
        databaseURL: "https://cs-database-42dd0-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "cs-database-42dd0",
        storageBucket: "cs-database-42dd0.firebasestorage.app",
        messagingSenderId: "265634068059",
        appId: "1:265634068059:web:4437f49f445c18d574717e"
    };

    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const forumRef = database.ref('cs_department_forum_queries_global');

    // Auth Info from local storage
    const loggedUserName = localStorage.getItem("loggedUserName") || "";
    const isAdmin = localStorage.getItem("loggedUserReg") === "ADMIN";

    // Pre-fill author name if logged in
    const authorInputMain = document.getElementById('author-name');
    if (authorInputMain && loggedUserName) {
        authorInputMain.value = loggedUserName;
    }

    // This object will hold our "Open" states so the UI doesn't collapse on every update
    let openStates = {};

    // 2. The Core Rendering Function
    const renderQueries = (dataSnapshot) => {
        const queries = dataSnapshot || {};
        const queryKeys = Object.keys(queries).reverse(); // Newest first
        
        if (queryKeys.length === 0) {
            queriesList.innerHTML = '<div class="no-queries">No queries yet. Be the first to ask!</div>';
            return;
        }

        queriesList.innerHTML = queryKeys.map(key => {
            const query = queries[key];
            const answers = query.answers || {};
            const answerKeys = Object.keys(answers);
            const isActive = openStates[key] ? 'active' : '';
            
            return `
                <div class="query-card" data-id="${key}">
                    <div class="query-meta">
                        <span class="query-author">${query.author} ${ (query.role === 'Teacher' || query.role === 'Admin') ? '<span class="answer-author teacher">Faculty</span>' : ''}</span>
                        <span class="query-time">${query.timestamp}</span>
                    </div>
                    <div class="query-text">${query.text}</div>
                    
                    <div class="query-actions">
                        <button class="answer-btn" onclick="toggleAnswers('${key}')">
                            Answers (${answerKeys.length})
                        </button>
                        <button class="answer-btn" style="border-color: var(--accent-secondary); color: var(--accent-secondary);" onclick="showAnswerForm('${key}')">
                            Reply
                        </button>
                        ${isAdmin ? `<button class="answer-btn" style="border-color: #ef4444; color: #ef4444;" onclick="deleteQuery('${key}')">Delete</button>` : ''}
                    </div>

                    <div id="answers-${key}" class="answers-container ${isActive}">
                        ${answerKeys.map(ansKey => {
                            const ans = answers[ansKey];
                            return `
                                <div class="answer-item">
                                    <div class="answer-meta">
                                        <span class="query-author">${ans.author} ${ (ans.role === 'Teacher' || ans.role === 'Admin') ? '<span class="answer-author teacher">Faculty</span>' : ''}</span>
                                        <span>• ${ans.timestamp}</span>
                                    </div>
                                    <div class="answer-text">${ans.text}</div>
                                    ${isAdmin ? `<button class="answer-btn" style="border-color: #ef4444; color: #ef4444; margin-top: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="deleteAnswer('${key}', '${ansKey}')">Delete Answer</button>` : ''}
                                </div>
                            `;
                        }).join('')}
                        
                        <div id="answer-form-container-${key}" class="answer-form">
                            <div class="form-group">
                                <input type="text" id="ans-author-${key}" class="forum-input" style="padding: 0.5rem 1rem; margin-bottom: 0.5rem; font-size: 0.8rem;" placeholder="Your Name" value="${loggedUserName}">
                                <textarea id="ans-text-${key}" class="forum-textarea" style="min-height: 80px; font-size: 0.9rem;" placeholder="Write your answer..."></textarea>
                            </div>
                            <button class="submit-btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem;" onclick="submitAnswer('${key}')">Submit Answer</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    // 3. REAL-TIME LISTENER
    // This is the "Bug Fix": It listens for any change and immediately re-renders
    forumRef.on('value', (snapshot) => {
        const data = snapshot.val();
        renderQueries(data);
    });

    // 4. Global UI Interaction Handles
    window.toggleAnswers = (key) => {
        const container = document.getElementById(`answers-${key}`);
        container.classList.toggle('active');
        // Save state so it persists during a real-time refresh
        openStates[key] = container.classList.contains('active');
    };

    window.showAnswerForm = (key) => {
        const container = document.getElementById(`answers-${key}`);
        const form = document.getElementById(`answer-form-container-${key}`);
        container.classList.add('active');
        form.classList.add('active');
        openStates[key] = true;
    };

    window.submitAnswer = (queryKey) => {
        const authorInput = document.getElementById(`ans-author-${queryKey}`);
        const textInput = document.getElementById(`ans-text-${queryKey}`);

        if (!authorInput.value || !textInput.value) {
            alert("Please fill in both name and answer.");
            return;
        }

        const newAnswer = {
            author: authorInput.value,
            role: (authorInput.value.toLowerCase().includes('miss') || authorInput.value.toLowerCase().includes('teacher') || authorInput.value.toLowerCase().includes('admin')) ? 'Teacher' : 'Student',
            text: textInput.value,
            timestamp: new Date().toLocaleString()
        };

        // Firebase .push() triggers the 'value' listener above automatically
        forumRef.child(queryKey).child('answers').push(newAnswer);
    };

    window.deleteQuery = (key) => {
        if (confirm("Are you sure you want to delete this query globally?")) {
            forumRef.child(key).remove();
        }
    };

    window.deleteAnswer = (queryKey, answerKey) => {
        if (confirm("Are you sure you want to delete this answer globally?")) {
            forumRef.child(queryKey).child('answers').child(answerKey).remove();
        }
    };

    // Handle New Query Submission
    queryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const authorName = document.getElementById('author-name').value;
        const queryContent = document.getElementById('query-content').value;

        const newQuery = {
            author: authorName,
            role: (authorName.toLowerCase().includes('miss') || authorName.toLowerCase().includes('teacher') || authorName.toLowerCase().includes('admin')) ? 'Teacher' : 'Student',
            text: queryContent,
            timestamp: new Date().toLocaleString()
        };

        forumRef.push(newQuery).then(() => {
            queryForm.reset();
            if (authorInputMain && loggedUserName) {
                authorInputMain.value = loggedUserName;
            }
        });
    });
});
