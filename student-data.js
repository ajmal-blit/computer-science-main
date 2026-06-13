/* Local fallback data for the CS portal.
   Firebase remains the primary source. This fallback keeps login/dashboard usable
   when Firebase rules, CSP, or network issues prevent the public database read. */
(function () {
  'use strict';

  const DEFAULT_GRADES = [
    { s: 'English', g: 'Pending' },
    { s: 'Arabic', g: 'Pending' },
    { s: 'Computer Science', g: 'Pending' },
    { s: 'Mathematics', g: 'Pending' }
  ];

  const STUDENTS = [
    { rank: 1, name: 'Ajmal NT', reg: 'GVAZSCS002', sgpa: 9.286 },
    { rank: 2, name: 'Munshifa P', reg: 'GVAZSCS017', sgpa: 8.857 },
    { rank: 3, name: 'Fathima Huda PC', reg: 'GVAZSCS006', sgpa: 8.667 },
    { rank: 4, name: 'Fathima Hannin MP', reg: 'GVAZSCS004', sgpa: 8.333 },
    { rank: 5, name: 'Jumana Jebin M', reg: 'GVAZSCS008', sgpa: 8.238 },
    { rank: 6, name: 'Fathima Hanna', reg: 'GVAZSCS005', sgpa: 7.333 },
    { rank: 7, name: 'Safna Sheri AT', reg: 'GVAZSCS018', sgpa: 7.333 },
    { rank: 8, name: 'Shelshal Jubin KC', reg: 'GVAZSCS020', sgpa: 7.190 },
    { rank: 9, name: 'Muhammed Aflah A', reg: 'GVAZSCS013', sgpa: 6.857 },
    { rank: 10, name: 'Jasfal C', reg: 'GVAZSCS007', sgpa: 5.810 },
    { rank: 11, name: 'Muhammed Razique PK', reg: 'GVAZSCS015', sgpa: 5.762 },
    { rank: 12, name: 'Mohammed Shaheer', reg: 'GVAZSCS010', sgpa: 5.333 },
    { rank: 13, name: 'Abdul Rashid M', reg: 'GVAZSCS001', sgpa: 0.000 },
    { rank: 14, name: 'Anshif Hyder', reg: 'GVAZSCS003', sgpa: 0.000 },
    { rank: 15, name: 'Mohammed Fadil', reg: 'GVAZSCS009', sgpa: 0.000 },
    { rank: 16, name: 'Mohammed Sinan CK', reg: 'GVAZSCS011', sgpa: 0.000 },
    { rank: 17, name: 'Muhammed Shamil K', reg: 'GVAZSCS012', sgpa: 0.000 },
    { rank: 18, name: 'Muhammed BazilSha T', reg: 'GVAZSCS014', sgpa: 0.000 },
    { rank: 19, name: 'Muhammed Sinan NK', reg: 'GVAZSCS016', sgpa: 0.000 },
    { rank: 20, name: 'Shamnad PK', reg: 'GVAZSCS019', sgpa: 0.000 }
  ];

  function normalizeRegNo(value) {
    return String(value || '').trim().toUpperCase();
  }

  function makeProfile(student) {
    if (!student) return null;
    return {
      name: student.name,
      regNo: student.reg,
      role: 'Student',
      sgpa: Number(student.sgpa || 0),
      attendance: 0,
      grades: DEFAULT_GRADES.map((item) => ({ ...item })),
      tasks: []
    };
  }

  function getStudent(regNo) {
    const normalized = normalizeRegNo(regNo);
    return makeProfile(STUDENTS.find((student) => student.reg === normalized));
  }

  function getAllStudents() {
    return STUDENTS.reduce((acc, student) => {
      acc[student.reg] = makeProfile(student);
      return acc;
    }, {});
  }

  function verifyFallbackLogin(regNo, password) {
    const normalized = normalizeRegNo(regNo);
    const enteredPassword = String(password || '').trim().toUpperCase();
    const student = getStudent(normalized);
    if (!student) return null;

    // Fallback password rule: use the registration number itself.
    // Example: Reg No GVAZSCS002, Passcode GVAZSCS002.
    if (enteredPassword === normalized) return student;
    return null;
  }

  window.CSLocalData = Object.freeze({
    students: STUDENTS.map((item) => ({ ...item })),
    getStudent,
    getAllStudents,
    verifyFallbackLogin
  });
}());
