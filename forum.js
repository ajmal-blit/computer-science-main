document.addEventListener("DOMContentLoaded", () => {
    const queryForm = document.getElementById("query-form");
    const queriesList = document.getElementById("queries-list");

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDz7PWoH4vbObyhYXhXNqi2Cr5uwjBdwJY",
        authDomain: "cs-database-42dd0.firebaseapp.com",
        databaseURL: "https://cs-database-42dd0-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "cs-database-42dd0",
        storageBucket: "cs-database-42dd0.firebasestorage.app",
        messagingSenderId: "265634068059",
        appId: "1:265634068059:web:4437f49f445c18d574717e"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    const database = firebase.database();
    const forumRef = database.ref("cs_department_forum_queries_global");

    const loggedUserName = localStorage.getItem("loggedUserName") || "";
    const isAdmin = localStorage.getItem("loggedUserReg") === "ADMIN";

    const authorInputMain = document.getElementById("author-name");
    const queryContentMain = document.getElementById("query-content");

    if (authorInputMain) {
        authorInputMain.maxLength = 60;
        if (loggedUserName) authorInputMain.value = loggedUserName;
    }

    if (queryContentMain) {
        queryContentMain.maxLength = 1000;
    }

    const openStates = {};

    function safeString(value) {
        return String(value ?? "");
    }

    function cleanText(value, maxLength) {
        return safeString(value).trim().slice(0, maxLength);
    }

    function getRole(name) {
        const n = safeString(name).toLowerCase();
        return (n.includes("miss") || n.includes("teacher") || n.includes("admin")) ? "Teacher" : "Student";
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = safeString(text);
        return node;
    }

    function addFacultyBadge(parent, role) {
        if (role === "Teacher" || role === "Admin") {
            parent.append(" ");
            parent.appendChild(el("span", "answer-author teacher", "Faculty"));
        }
    }

    function makeButton(text, className, onClick) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = className || "answer-btn";
        btn.textContent = text;
        btn.addEventListener("click", onClick);
        return btn;
    }

    function renderQueries(dataSnapshot) {
        const queries = dataSnapshot || {};
        const queryKeys = Object.keys(queries).reverse();

        queriesList.replaceChildren();

        if (queryKeys.length === 0) {
            queriesList.appendChild(el("div", "no-queries", "No queries yet. Be the first to ask!"));
            return;
        }

        queryKeys.forEach((key) => {
            const query = queries[key] || {};
            const answers = query.answers || {};
            const answerKeys = Object.keys(answers);

            const card = el("div", "query-card");
            card.dataset.id = key;

            const meta = el("div", "query-meta");
            const author = el("span", "query-author", query.author || "Unknown");
            addFacultyBadge(author, query.role);
            const time = el("span", "query-time", query.timestamp || "");
            meta.append(author, time);

            const queryText = el("div", "query-text", query.text || "");

            const actions = el("div", "query-actions");
            const answersContainer = el("div", "answers-container");
            if (openStates[key]) answersContainer.classList.add("active");

            const toggleBtn = makeButton(`Answers (${answerKeys.length})`, "answer-btn", () => {
                answersContainer.classList.toggle("active");
                openStates[key] = answersContainer.classList.contains("active");
            });

            actions.appendChild(toggleBtn);

            answerKeys.forEach((ansKey) => {
                const ans = answers[ansKey] || {};

                const answerItem = el("div", "answer-item");

                const answerMeta = el("div", "answer-meta");
                const answerAuthor = el("span", "query-author", ans.author || "Unknown");
                addFacultyBadge(answerAuthor, ans.role);
                const answerTime = el("span", "", `• ${ans.timestamp || ""}`);
                answerMeta.append(answerAuthor, answerTime);

                const answerText = el("div", "answer-text", ans.text || "");

                answerItem.append(answerMeta, answerText);

                if (isAdmin) {
                    answerItem.appendChild(makeButton("Delete Answer", "answer-btn delete-btn", () => {
                        if (confirm("Are you sure you want to delete this answer globally?")) {
                            forumRef.child(key).child("answers").child(ansKey).remove();
                        }
                    }));
                }

                answersContainer.appendChild(answerItem);
            });

            const answerForm = el("div", "answer-form");

            const group = el("div", "form-group");
            const answerAuthorInput = document.createElement("input");
            answerAuthorInput.type = "text";
            answerAuthorInput.className = "forum-input";
            answerAuthorInput.placeholder = "Your Name";
            answerAuthorInput.maxLength = 60;
            answerAuthorInput.value = loggedUserName;

            const answerTextInput = document.createElement("textarea");
            answerTextInput.className = "forum-textarea";
            answerTextInput.placeholder = "Write your answer...";
            answerTextInput.maxLength = 1000;

            group.append(answerAuthorInput, answerTextInput);

            const submitAnswerBtn = makeButton("Submit Answer", "submit-btn", () => {
                submitAnswer(key, answerAuthorInput, answerTextInput);
            });

            answerForm.append(group, submitAnswerBtn);

            const replyBtn = makeButton("Reply", "answer-btn reply-btn", () => {
                answersContainer.classList.add("active");
                answerForm.classList.add("active");
                openStates[key] = true;
            });

            actions.appendChild(replyBtn);

            if (isAdmin) {
                actions.appendChild(makeButton("Delete", "answer-btn delete-btn", () => {
                    if (confirm("Are you sure you want to delete this query globally?")) {
                        forumRef.child(key).remove();
                    }
                }));
            }

            answersContainer.appendChild(answerForm);
            card.append(meta, queryText, actions, answersContainer);
            queriesList.appendChild(card);
        });
    }

    function submitAnswer(queryKey, authorInput, textInput) {
        const author = cleanText(authorInput.value, 60);
        const text = cleanText(textInput.value, 1000);

        if (!author || !text) {
            alert("Please fill in both name and answer.");
            return;
        }

        const newAnswer = {
            author,
            role: getRole(author),
            text,
            timestamp: new Date().toLocaleString()
        };

        forumRef.child(queryKey).child("answers").push(newAnswer).then(() => {
            textInput.value = "";
        });
    }

    forumRef.on("value", (snapshot) => {
        renderQueries(snapshot.val());
    });

    queryForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const authorName = cleanText(document.getElementById("author-name").value, 60);
        const queryContent = cleanText(document.getElementById("query-content").value, 1000);

        if (!authorName || !queryContent) {
            alert("Please fill in both name and query.");
            return;
        }

        const newQuery = {
            author: authorName,
            role: getRole(authorName),
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
