document.addEventListener("DOMContentLoaded", () => {
    const queryForm = document.getElementById('query-form');
    const queriesList = document.getElementById('queries-list');

    // Auth Info
    const loggedUserName = localStorage.getItem("loggedUserName") || "";
    const isAdmin = localStorage.getItem("loggedUserReg") === "ADMIN";
    const STORAGE_KEY = 'cs_department_forum_queries';

    // Pre-fill author name if logged in
    const authorInputMain = document.getElementById('author-name');
    if (authorInputMain && loggedUserName) {
        authorInputMain.value = loggedUserName;
    }

    // Initial Data if empty
    const initialQueries = [
        {
            id: Date.now(),
            author: "Administrator",
            role: "Admin",
            text: "Welcome to the CS Department Forum! Feel free to ask any technical or academic questions here.",
            timestamp: new Date().toLocaleString(),
            answers: []
        }
    ];

    // Load queries from localStorage
    let queries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialQueries;

    // Save queries to localStorage
    const saveQueries = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    };

    // Render Queries
    const renderQueries = () => {
        if (queries.length === 0) {
            queriesList.innerHTML = '<div class="no-queries">No queries yet. Be the first to ask!</div>';
            return;
        }

        queriesList.innerHTML = queries.map(query => `
            <div class="query-card" data-id="${query.id}">
                <div class="query-meta">
                    <span class="query-author">${query.author} ${ (query.role === 'Teacher' || query.role === 'Admin') ? '<span class="answer-author teacher">Faculty</span>' : ''}</span>
                    <span class="query-time">${query.timestamp}</span>
                </div>
                <div class="query-text">${query.text}</div>
                
                <div class="query-actions">
                    <button class="answer-btn" onclick="toggleAnswers(${query.id})">
                        Answers (${query.answers.length})
                    </button>
                    <button class="answer-btn" style="border-color: var(--accent-secondary); color: var(--accent-secondary);" onclick="showAnswerForm(${query.id})">
                        Reply
                    </button>
                    ${isAdmin ? `<button class="answer-btn" style="border-color: #ef4444; color: #ef4444;" onclick="deleteQuery(${query.id})">Delete</button>` : ''}
                </div>

                <div id="answers-${query.id}" class="answers-container">
                    ${query.answers.map((ans, idx) => `
                        <div class="answer-item">
                            <div class="answer-meta">
                                <span class="query-author">${ans.author} ${ (ans.role === 'Teacher' || ans.role === 'Admin') ? '<span class="answer-author teacher">Faculty</span>' : ''}</span>
                                <span>• ${ans.timestamp}</span>
                            </div>
                            <div class="answer-text">${ans.text}</div>
                            ${isAdmin ? `<button class="answer-btn" style="border-color: #ef4444; color: #ef4444; margin-top: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="deleteAnswer(${query.id}, ${idx})">Delete Answer</button>` : ''}
                        </div>
                    `).join('')}
                    
                    <div id="answer-form-container-${query.id}" class="answer-form">
                        <div class="form-group">
                            <input type="text" id="ans-author-${query.id}" class="forum-input" style="padding: 0.5rem 1rem; margin-bottom: 0.5rem; font-size: 0.8rem;" placeholder="Your Name" value="${loggedUserName}">
                            <textarea id="ans-text-${query.id}" class="forum-textarea" style="min-height: 80px; font-size: 0.9rem;" placeholder="Write your answer..."></textarea>
                        </div>
                        <button class="submit-btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem;" onclick="submitAnswer(${query.id})">Submit Answer</button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Global handles for internal functions (simplest way for inline onclick)
    window.toggleAnswers = (id) => {
        const container = document.getElementById(`answers-${id}`);
        container.classList.toggle('active');
    };

    window.showAnswerForm = (id) => {
        const container = document.getElementById(`answers-${id}`);
        const form = document.getElementById(`answer-form-container-${id}`);
        container.classList.add('active');
        form.classList.add('active');
    };

    window.submitAnswer = (queryId) => {
        const authorInput = document.getElementById(`ans-author-${queryId}`);
        const textInput = document.getElementById(`ans-text-${queryId}`);

        if (!authorInput.value || !textInput.value) {
            alert("Please fill in both name and answer.");
            return;
        }

        const query = queries.find(q => q.id === queryId);
        if (query) {
            query.answers.push({
                author: authorInput.value,
                role: (authorInput.value.toLowerCase().includes('miss') || authorInput.value.toLowerCase().includes('teacher') || authorInput.value.toLowerCase().includes('admin')) ? 'Teacher' : 'Student',
                text: textInput.value,
                timestamp: new Date().toLocaleString()
            });
            saveQueries();
            renderQueries();
            // Re-open to show the result
            window.toggleAnswers(queryId);
        }
    };

    window.deleteQuery = (id) => {
        if (confirm("Are you sure you want to delete this query?")) {
            queries = queries.filter(q => q.id !== id);
            saveQueries();
            renderQueries();
        }
    };

    window.deleteAnswer = (queryId, answerIdx) => {
        if (confirm("Are you sure you want to delete this answer?")) {
            const query = queries.find(q => q.id === queryId);
            if (query) {
                query.answers.splice(answerIdx, 1);
                saveQueries();
                renderQueries();
                window.toggleAnswers(queryId); // Keep it open
            }
        }
    };

    // Handle Query Submission
    queryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const authorName = document.getElementById('author-name').value;
        const queryContent = document.getElementById('query-content').value;

        const newQuery = {
            id: Date.now(),
            author: authorName,
            role: (authorName.toLowerCase().includes('miss') || authorName.toLowerCase().includes('teacher') || authorName.toLowerCase().includes('admin')) ? 'Teacher' : 'Student',
            text: queryContent,
            timestamp: new Date().toLocaleString(),
            answers: []
        };

        queries.unshift(newQuery); // Newest first
        saveQueries();
        renderQueries();
        queryForm.reset();
    });

    // Initial Render
    renderQueries();

    // Secondary fallback to show body if script.js isn't caught correctly
    setTimeout(() => {
        document.body.style.opacity = "1";
        document.body.classList.add("show");
    }, 100);
});
