const API = "https://computer-science-main.onrender.com/api";

let forumPosts = [];

// ================= LOAD =================
async function loadPosts() {
  const res = await fetch(`${API}/posts`);
  forumPosts = await res.json();
  renderForum();
}

// ================= RENDER =================
function renderForum() {
  const container = document.getElementById("posts");
  const badge = document.getElementById("postCountBadge");

  badge.innerText = `${forumPosts.length} posts`;

  container.innerHTML = forumPosts.map(post => `
    <div class="post">
      <h3>${post.title}</h3>
      <p>${post.content}</p>

      <button onclick="likePost('${post._id}')">
        ❤️ ${post.likes}
      </button>

      <button onclick="deletePost('${post._id}')">
        🗑️ Delete
      </button>

      <div>
        ${post.comments.map(c => `<p>💬 ${c.text}</p>`).join("")}
      </div>

      <input id="c-${post._id}" placeholder="Reply">
      <button onclick="addComment('${post._id}')">Reply</button>
    </div>
  `).join("");
}

// ================= CREATE =================
document.getElementById("publishBtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  await fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content })
  });

  loadPosts();
});

// ================= LIKE =================
async function likePost(id) {
  await fetch(`${API}/posts/${id}/like`, { method: "POST" });
  loadPosts();
}

// ================= DELETE =================
async function deletePost(id) {
  await fetch(`${API}/posts/${id}`, { method: "DELETE" });
  loadPosts();
}

// ================= COMMENT =================
async function addComment(id) {
  const input = document.getElementById(`c-${id}`);
  const text = input.value;

  if (!text) return;

  await fetch(`${API}/posts/${id}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  loadPosts();
}

// ================= INIT =================
loadPosts();