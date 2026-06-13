document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const session = CSAuth.requireAuth();
  const database = CSAuth.initFirebase();
  const dbRef = database.ref('globalStudentDB');
  const regNo = CSAuth.normalizeRegNo(session.regNo);

  let studentDB = {};
  let currentUser = null;
  let isAdmin = false;

  const adminSection = document.getElementById('admin-section');
  const studentSelect = document.getElementById('student-select');
  const taskInput = document.getElementById('task-input');

  const allowedStatus = new Set(['pending', 'submitted']);

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function safeTaskText(value) { return CSAuth.cleanText(value, 250); }

  function setInitialUserUI(data) {
    const fallback = { name: 'Guest', sgpa: 0, attendance: 0, grades: [], tasks: [] };
    const user = data || fallback;
    CSAuth.setText(document.getElementById('user-name'), user.name || 'Guest');
    CSAuth.setText(document.getElementById('user-reg'), 'Reg No: ' + (regNo || 'N/A'));
    document.getElementById('user-sgpa').setAttribute('data-target', Number(user.sgpa || 0));
    document.getElementById('user-attendance').setAttribute('data-target', Number(user.attendance || 0));

    const subBox = document.getElementById('subject-container');
    clear(subBox);
    (Array.isArray(user.grades) ? user.grades : []).forEach((item) => {
      const row = el('div', 'list-item');
      row.appendChild(el('span', '', CSAuth.cleanText(item.s, 80)));
      const pill = el('span', 'grade-pill ' + getGradeStyle(item.g), String(item.g) === 'null' ? 'Pending' : CSAuth.cleanText(item.g, 20));
      row.appendChild(pill);
      subBox.appendChild(row);
    });
    renderTasks();
    startCounters();
  }

  dbRef.child(regNo).once('value').then((snapshot) => {
    currentUser = snapshot.val();
    if (!currentUser) {
      CSAuth.logout(true);
      return;
    }

    isAdmin = regNo === 'ADMIN' && String(currentUser.role || 'Admin').toLowerCase() === 'admin';

    if (isAdmin) {
      if (adminSection) adminSection.style.display = 'flex';
      dbRef.on('value', (snap) => {
        studentDB = snap.val() || {};
        populateAdminStudentSelect();
        setInitialUserUI(studentDB[regNo]);
      });
    } else {
      if (adminSection) adminSection.style.display = 'none';
      dbRef.child(regNo).on('value', (snap) => {
        studentDB = { [regNo]: snap.val() || currentUser };
        setInitialUserUI(studentDB[regNo]);
      });
    }
  }).catch(() => CSAuth.logout(true));

  function populateAdminStudentSelect() {
    if (!studentSelect || !isAdmin) return;
    const previous = studentSelect.value;
    clear(studentSelect);
    Object.keys(studentDB).sort().forEach((studentID) => {
      if (studentID === 'ADMIN') return;
      const student = studentDB[studentID] || {};
      const option = document.createElement('option');
      option.value = studentID;
      option.textContent = CSAuth.cleanText(student.name || studentID, 80);
      studentSelect.appendChild(option);
    });
    if ([...studentSelect.options].some((opt) => opt.value === previous)) studentSelect.value = previous;
  }

  function getGradeStyle(g) {
    const grade = String(g || '').toUpperCase();
    if (['O', 'A+', 'A'].includes(grade)) return grade === 'O' ? 'grade-o' : 'grade-ap';
    if (grade === 'F') return 'grade-f';
    return 'grade-default';
  }

  window.renderTasks = () => {
    const taskBox = document.getElementById('task-container');
    clear(taskBox);
    if (isAdmin) {
      Object.keys(studentDB).sort().forEach((studentID) => {
        if (studentID === 'ADMIN') return;
        const tasks = Array.isArray(studentDB[studentID]?.tasks) ? studentDB[studentID].tasks : [];
        tasks.forEach((task, idx) => taskBox.appendChild(createTaskNode(task, studentID, idx, true)));
      });
    } else {
      const tasks = Array.isArray(studentDB[regNo]?.tasks) ? studentDB[regNo].tasks : [];
      tasks.forEach((task, idx) => taskBox.appendChild(createTaskNode(task, regNo, idx, false)));
    }
  };

  function createTaskNode(task, ownerID, idx, isAdm) {
    const status = allowedStatus.has(task?.status) ? task.status : 'pending';
    const isSub = status === 'submitted';
    const row = el('div', 'list-item');
    const info = el('div', 'task-info');
    const textWrap = document.createElement('span');

    if (isAdm) {
      const owner = el('small', '', CSAuth.cleanText(studentDB[ownerID]?.name || ownerID, 80));
      owner.style.display = 'block';
      owner.style.color = 'var(--primary)';
      textWrap.appendChild(owner);
    }

    const bullet = document.createElement('span');
    bullet.style.color = isSub ? '#22c55e' : '#ef4444';
    bullet.textContent = '●';
    textWrap.appendChild(bullet);
    textWrap.appendChild(document.createTextNode(' ' + safeTaskText(task?.text || 'Untitled task')));
    info.appendChild(textWrap);

    const actions = el('div', 'task-actions');
    const statusLabel = document.createElement('span');
    statusLabel.style.fontSize = '0.6rem';
    statusLabel.style.padding = '2px 6px';
    statusLabel.style.border = '1px solid ' + (isSub ? '#22c55e' : '#ef4444');
    statusLabel.style.color = isSub ? '#22c55e' : '#ef4444';
    statusLabel.textContent = status.toUpperCase();
    actions.appendChild(statusLabel);

    if (isAdm) {
      const adminButtons = el('div', 'task-actions');
      const toggle = el('button', 'action-btn btn-status', 'TOGGLE');
      toggle.type = 'button';
      toggle.addEventListener('click', () => window.toggleStatus(ownerID, idx));
      const remove = el('button', 'action-btn btn-remove', 'REMOVE');
      remove.type = 'button';
      remove.addEventListener('click', () => window.removeTask(ownerID, idx));
      adminButtons.append(toggle, remove);
      actions.appendChild(adminButtons);
    }

    row.append(info, actions);
    return row;
  }

  function ensureAdmin() {
    if (!isAdmin) {
      alert('Admin access required.');
      return false;
    }
    return true;
  }

  window.pushTask = () => {
    if (!ensureAdmin()) return;
    const target = CSAuth.normalizeRegNo(studentSelect.value);
    const text = safeTaskText(taskInput.value);
    if (!target || !text) return;

    const targetRef = dbRef.child(target).child('tasks');
    targetRef.transaction((tasks) => {
      const list = Array.isArray(tasks) ? tasks : [];
      list.push({ text, status: 'pending' });
      return list.slice(-100);
    }).then(() => { taskInput.value = ''; });
  };

  window.toggleStatus = (id, idx) => {
    if (!ensureAdmin()) return;
    const safeID = CSAuth.normalizeRegNo(id);
    dbRef.child(safeID).child('tasks').transaction((tasks) => {
      if (!Array.isArray(tasks) || !tasks[idx]) return tasks;
      tasks[idx].status = tasks[idx].status === 'pending' ? 'submitted' : 'pending';
      return tasks;
    });
  };

  window.removeTask = (id, idx) => {
    if (!ensureAdmin()) return;
    if (!confirm('Delete task?')) return;
    const safeID = CSAuth.normalizeRegNo(id);
    dbRef.child(safeID).child('tasks').transaction((tasks) => {
      if (!Array.isArray(tasks)) return tasks;
      tasks.splice(idx, 1);
      return tasks;
    });
  };

  function startCounters() {
    document.querySelectorAll('.count-up').forEach((counter) => {
      const target = Number(counter.getAttribute('data-target') || 0);
      let count = 0;
      const update = () => {
        if (count < target) {
          count += target / 40;
          counter.textContent = counter.id === 'user-sgpa' ? count.toFixed(3) : Math.ceil(count) + '%';
          setTimeout(update, 20);
        } else {
          counter.textContent = counter.id === 'user-sgpa' ? target.toFixed(3) : target + '%';
        }
      };
      update();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('reveal'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('section').forEach((section) => observer.observe(section));
});
