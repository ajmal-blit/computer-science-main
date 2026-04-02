// ================= DATA =================
let forumPosts = JSON.parse(localStorage.getItem("forumPosts")) || [];
let likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];

// ================= HELPERS =================
function generateId() {
  return Date.now() + "-" + Math.random().toString(36).substring(2, 8);
}

function saveData() {
  localStorage.setItem("forumPosts", JSON.stringify(forumPosts));
}

function formatDate(dateObj) {
  const now = new Date();
  const diff = now - dateObj;

  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (hour < 24) return `${hour} hr ago`;
  if (day < 7) return `${day} day ago`;

  return dateObj.toLocaleDateString();
}

function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m],
  );
}

// ================= RENDER =================
function renderForum() {
  const container = document.getElementById("posts");
  const badge = document.getElementById("postCountBadge");

  if (!container) return;

  badge.innerText = `${forumPosts.length} posts`;

  if (forumPosts.length === 0) {
    container.innerHTML = `<div class="empty-state">No discussions yet 🚀</div>`;
    return;
  }

  const sorted = [...forumPosts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  container.innerHTML = sorted
    .map(
      (post) => `
    <div class="post-item">
      <div class="post-header">
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-date">${formatDate(new Date(post.createdAt))}</div>
      </div>

      <div class="post-content">${escapeHtml(post.content)}</div>

      <div class="post-actions">
        <button class="action-btn like-btn ${likedPosts.includes(post.id) ? "liked" : ""}" data-id="${post.id}">
          ❤️ ${post.likes || 0}
        </button>

        <button class="action-btn reply-btn" data-id="${post.id}">
          💬 ${post.comments.length}
        </button>

        <button class="action-btn delete-btn" data-id="${post.id}">
          🗑️ Delete
        </button>
      </div>

      <div class="comment-section">
        ${post.comments
          .map(
            (c) => `
          <div class="single-comment">
            ${escapeHtml(c.text)}
          </div>
        `,
          )
          .join("")}

       <div class="add-comment">
  <textarea 
    class="comment-input auto-expand" 
    rows="1"
    placeholder="Write a thoughtful reply..."
    data-input="${post.id}"
  ></textarea>

  <button 
    class="comment-submit" 
    data-reply="${post.id}"
  >
    Reply
  </button>
</div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ================= ACTIONS =================
function createPost() {
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Fill all fields");
    return;
  }

  forumPosts.push({
    id: generateId(),
    title,
    content,
    createdAt: new Date(),
    likes: 0,
    comments: [],
  });

  titleInput.value = "";
  contentInput.value = "";

  saveData();
  renderForum();
}
// ================= EVENT SYSTEM (NO INLINE JS) =================
document.addEventListener("click", (e) => {
  const id = e.target.dataset.id;

  // LIKE
 if (e.target.classList.contains("like-btn")) {
  const post = forumPosts.find(p => p.id === id);
  if (!post) return;

  if (likedPosts.includes(id)) {
    // UNLIKE
    likedPosts = likedPosts.filter(pid => pid !== id);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // LIKE (only once)
    likedPosts.push(id);
    post.likes += 1;
  }

  localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  saveData();
  renderForum();
}

  // DELETE POST
  if (e.target.classList.contains("delete-btn")) {
    forumPosts = forumPosts.filter((p) => p.id !== id);
    saveData();
    renderForum();
  }

  // ADD COMMENT
  if (e.target.dataset.reply) {
    const postId = e.target.dataset.reply;
    const input = document.querySelector(`[data-input="${postId}"]`);
    const text = input.value.trim();

    if (!text) return;

    const post = forumPosts.find((p) => p.id === postId);
    post.comments.push({ text, createdAt: new Date() });

    input.value = "";
    saveData();
    renderForum();
  }
});

// ================= INIT =================
document.getElementById("publishBtn").addEventListener("click", createPost);

renderForum();
