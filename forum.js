document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const session = CSAuth.requireAuth();
  const queryForm = document.getElementById('query-form');
  const queriesList = document.getElementById('queries-list');
  const database = CSAuth.initFirebase();
  const forumRef = database.ref('cs_department_forum_queries_global');
  const loggedUserName = session.name || '';
  const isAdmin = session.regNo === 'ADMIN' && String(session.role || '').toLowerCase() === 'admin';
  const openStates = {};

  const authorInputMain = document.getElementById('author-name');
  if (authorInputMain && loggedUserName) authorInputMain.value = loggedUserName;

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function cleanLong(value) { return CSAuth.cleanText(value, 1000); }
  function roleLabel(role) { return (role === 'Teacher' || role === 'Admin') ? 'Faculty' : ''; }
  function currentRole() { return isAdmin ? 'Admin' : (String(session.role || '').toLowerCase() === 'teacher' ? 'Teacher' : 'Student'); }
  function timestamp() { return new Date().toLocaleString(); }

  function renderQueries(dataSnapshot) {
    const queries = dataSnapshot || {};
    const queryKeys = Object.keys(queries).reverse();
    clear(queriesList);

    if (queryKeys.length === 0) {
      queriesList.appendChild(el('div', 'no-queries', 'No queries yet. Be the first to ask!'));
      return;
    }

    queryKeys.forEach((key) => {
      const query = queries[key] || {};
      const answers = query.answers || {};
      const answerKeys = Object.keys(answers);
      queriesList.appendChild(createQueryCard(key, query, answerKeys, answers));
    });
  }

  function createQueryCard(key, query, answerKeys, answers) {
    const card = el('div', 'query-card');
    card.dataset.id = key;

    const meta = el('div', 'query-meta');
    const author = el('span', 'query-author', CSAuth.cleanText(query.author || 'Student', 80) + ' ');
    const label = roleLabel(query.role);
    if (label) author.appendChild(el('span', 'answer-author teacher', label));
    meta.append(author, el('span', 'query-time', CSAuth.cleanText(query.timestamp || '', 80)));

    const text = el('div', 'query-text', cleanLong(query.text || ''));

    const actions = el('div', 'query-actions');
    const answersBtn = el('button', 'answer-btn', `Answers (${answerKeys.length})`);
    answersBtn.type = 'button';
    answersBtn.addEventListener('click', () => toggleAnswers(key));

    const replyBtn = el('button', 'answer-btn', 'Reply');
    replyBtn.type = 'button';
    replyBtn.style.borderColor = 'var(--accent-secondary)';
    replyBtn.style.color = 'var(--accent-secondary)';
    replyBtn.addEventListener('click', () => showAnswerForm(key));
    actions.append(answersBtn, replyBtn);

    if (isAdmin) {
      const deleteBtn = el('button', 'answer-btn', 'Delete');
      deleteBtn.type = 'button';
      deleteBtn.style.borderColor = '#ef4444';
      deleteBtn.style.color = '#ef4444';
      deleteBtn.addEventListener('click', () => deleteQuery(key));
      actions.appendChild(deleteBtn);
    }

    const answersContainer = el('div', 'answers-container' + (openStates[key] ? ' active' : ''));
    answersContainer.id = `answers-${key}`;
    answerKeys.forEach((ansKey) => answersContainer.appendChild(createAnswerNode(key, ansKey, answers[ansKey] || {})));
    answersContainer.appendChild(createAnswerForm(key));

    card.append(meta, text, actions, answersContainer);
    return card;
  }

  function createAnswerNode(queryKey, ansKey, ans) {
    const item = el('div', 'answer-item');
    const meta = el('div', 'answer-meta');
    const author = el('span', 'query-author', CSAuth.cleanText(ans.author || 'Student', 80) + ' ');
    const label = roleLabel(ans.role);
    if (label) author.appendChild(el('span', 'answer-author teacher', label));
    meta.append(author, el('span', '', '• ' + CSAuth.cleanText(ans.timestamp || '', 80)));
    item.append(meta, el('div', 'answer-text', cleanLong(ans.text || '')));

    if (isAdmin) {
      const btn = el('button', 'answer-btn', 'Delete Answer');
      btn.type = 'button';
      btn.style.borderColor = '#ef4444';
      btn.style.color = '#ef4444';
      btn.style.marginTop = '0.5rem';
      btn.style.padding = '0.3rem 0.8rem';
      btn.style.fontSize = '0.75rem';
      btn.addEventListener('click', () => deleteAnswer(queryKey, ansKey));
      item.appendChild(btn);
    }
    return item;
  }

  function createAnswerForm(key) {
    const formWrap = el('div', 'answer-form');
    formWrap.id = `answer-form-container-${key}`;
    const group = el('div', 'form-group');

    const author = document.createElement('input');
    author.type = 'text';
    author.id = `ans-author-${key}`;
    author.className = 'forum-input';
    author.placeholder = 'Your Name';
    author.value = loggedUserName;
    author.maxLength = 80;
    author.style.padding = '0.5rem 1rem';
    author.style.marginBottom = '0.5rem';
    author.style.fontSize = '0.8rem';

    const textarea = document.createElement('textarea');
    textarea.id = `ans-text-${key}`;
    textarea.className = 'forum-textarea';
    textarea.placeholder = 'Write your answer...';
    textarea.maxLength = 1000;
    textarea.style.minHeight = '80px';
    textarea.style.fontSize = '0.9rem';

    const submit = el('button', 'submit-btn', 'Submit Answer');
    submit.type = 'button';
    submit.style.padding = '0.5rem 1.5rem';
    submit.style.fontSize = '0.8rem';
    submit.addEventListener('click', () => submitAnswer(key));

    group.append(author, textarea);
    formWrap.append(group, submit);
    return formWrap;
  }

  forumRef.limitToLast(100).on('value', (snapshot) => renderQueries(snapshot.val()));

  function toggleAnswers(key) {
    const container = document.getElementById(`answers-${key}`);
    if (!container) return;
    container.classList.toggle('active');
    openStates[key] = container.classList.contains('active');
  }

  function showAnswerForm(key) {
    const container = document.getElementById(`answers-${key}`);
    const form = document.getElementById(`answer-form-container-${key}`);
    if (!container || !form) return;
    container.classList.add('active');
    form.classList.add('active');
    openStates[key] = true;
  }

  function submitAnswer(queryKey) {
    const authorInput = document.getElementById(`ans-author-${queryKey}`);
    const textInput = document.getElementById(`ans-text-${queryKey}`);
    const author = CSAuth.cleanText(authorInput?.value || loggedUserName, 80);
    const text = cleanLong(textInput?.value || '');

    if (!author || !text) {
      alert('Please fill in both name and answer.');
      return;
    }

    forumRef.child(queryKey).child('answers').push({
      author,
      role: currentRole(),
      text,
      timestamp: timestamp(),
      regNo: session.regNo
    }).then(() => { textInput.value = ''; });
  }

  function deleteQuery(key) {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this query globally?')) forumRef.child(key).remove();
  }

  function deleteAnswer(queryKey, answerKey) {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this answer globally?')) forumRef.child(queryKey).child('answers').child(answerKey).remove();
  }

  queryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const authorName = CSAuth.cleanText(document.getElementById('author-name').value || loggedUserName, 80);
    const queryContent = cleanLong(document.getElementById('query-content').value || '');

    if (!authorName || !queryContent) {
      alert('Please fill in both name and query.');
      return;
    }

    forumRef.push({
      author: authorName,
      role: currentRole(),
      text: queryContent,
      timestamp: timestamp(),
      regNo: session.regNo
    }).then(() => {
      queryForm.reset();
      if (authorInputMain && loggedUserName) authorInputMain.value = loggedUserName;
    });
  });
});
