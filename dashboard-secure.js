document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const session = CSAuth.requireAuth();
  const regNo = CSAuth.normalizeRegNo(session.regNo);

  let database = null;
  let dbRef = null;
  let studentDB = {};
  let currentUser = null;
  let isAdmin = false;
  let firebaseReady = false;

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

  function getLocalUser() {
    if (!window.CSLocalData || typeof CSLocalData.getStudent !== 'function') return null;
    return CSLocalData.getStudent(regNo);
  }

  function getLocalDB() {
    if (!window.CSLocalData || typeof CSLocalData.getAllStudents !== 'function') return {};
    return CSLocalData.getAllStudents();
  }

  function showDashboardNotice(message) {
    const tasks = document.getElementById('task-container');
    if (!tasks || document.getElementById('dashboard-notice')) return;
    const notice = el('div', 'list-item', message);
    notice.id = 'dashboard-notice';
    notice.style.color = 'var(--muted)';
    tasks.appendChild(notice);
  }

  function setInitialUserUI(data) {
    const fallback = { name: session.name || 'Student', sgpa: 0, attendance: 0, grades: [], tasks: [] };
    const user = data || fallback;
    CSAuth.setText(document.getElementById('user-name'), user.name || session.name || 'Student');
    CSAuth.setText(document.getElementById('user-reg'), 'Reg No: ' + (regNo || 'N/A'));

    const sgpaCounter = document.getElementById('user-sgpa');
    const attendanceCounter = document.getElementById('user-attendance');
    if (sgpaCounter) sgpaCounter.setAttribute('data-target', Number(user.sgpa || 0));
    if (attendanceCounter) attendanceCounter.setAttribute('data-target', Number(user.attendance || 0));

    const subBox = document.getElementById('subject-container');
    clear(subBox);
    const grades = Array.isArray(user.grades) ? user.grades : [];
    if (!grades.length && subBox) {
      subBox.appendChild(el('div', 'list-item', 'No semester result data added yet.'));
    }
    grades.forEach((item) => {
      const row = el('div', 'list-item');
      row.appendChild(el('span', '', CSAuth.cleanText(item.s, 80)));
      const gradeText = String(item.g || '').toLowerCase() === 'null' ? 'Pending' : CSAuth.cleanText(item.g || 'Pending', 20);
      const pill = el('span', 'grade-pill ' + getGradeStyle(item.g), gradeText);
      row.appendChild(pill);
      subBox.appendChild(row);
    });
    window.renderTasks();
    startCounters();
  }

  function loadLocalDashboard() {
    currentUser = getLocalUser();
    if (!currentUser) {
      CSAuth.logout(true);
      return;
    }
    isAdmin = false;
    firebaseReady = false;
    studentDB = { [regNo]: currentUser };
    if (adminSection) adminSection.style.display = 'none';
    setInitialUserUI(currentUser);
    showDashboardNotice('Dashboard is running in local fallback mode. Firebase live tasks are unavailable.');
  }

  function initFirebaseDashboard() {
    try {
      database = CSAuth.initFirebase();
      dbRef = database.ref('globalStudentDB');
      firebaseReady = true;
    } catch (error) {
      console.warn('Firebase dashboard unavailable, loading local fallback:', error);
      loadLocalDashboard();
      return;
    }

    dbRef.child(regNo).once('value').then((snapshot) => {
      currentUser = snapshot.val();
      if (!currentUser) {
        const fallbackUser = getLocalUser();
        if (fallbackUser) {
          currentUser = fallbackUser;
          studentDB = { [regNo]: currentUser };
          firebaseReady = false;
          if (adminSection) adminSection.style.display = 'none';
          setInitialUserUI(currentUser);
          showDashboardNotice('No Firebase profile was found, so local fallback data is shown.');
          return;
        }
        CSAuth.logout(true);
        return;
      }

      isAdmin = regNo === 'ADMIN' && String(currentUser.role || 'Admin').toLowerCase() === 'admin';

      if (isAdmin) {
        if (adminSection) adminSection.style.display = 'flex';
        dbRef.on('value', (snap) => {
          studentDB = snap.val() || getLocalDB();
          populateAdminStudentSelect();
          setInitialUserUI(studentDB[regNo] || currentUser);
        }, () => loadLocalDashboard());
      } else {
        if (adminSection) adminSection.style.display = 'none';
        dbRef.child(regNo).on('value', (snap) => {
          studentDB = { [regNo]: snap.val() || currentUser };
          setInitialUserUI(studentDB[regNo]);
        }, () => loadLocalDashboard());
      }
    }).catch((error) => {
      console.warn('Firebase dashboard read failed, loading local fallback:', error);
      loadLocalDashboard();
    });
  }

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
      if (!tasks.length && taskBox) taskBox.appendChild(el('div', 'list-item', 'No tasks assigned yet.'));
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
    if (!isAdmin || !firebaseReady || !dbRef) {
      alert('Admin Firebase access required.');
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

  initFirebaseDashboard();
});
