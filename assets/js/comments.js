// assets/js/comments.js
(function () {
  // === CONFIGURATION ===
  const SANITY_PROJECT_ID = "cvypf2o3";
  const SANITY_DATASET = "production";

  // ✅ Vercel API Endpoints
  const COMMENT_API = "/api/submitcomment";  // main + replies supported

  // === HELPER FUNCTION ===
  function getPostSlug() {
    return location.pathname;
  }

  // === FETCH COMMENTS FROM SANITY ===
  async function fetchComments() {
    const slug = getPostSlug();
    const query = encodeURIComponent(`
      *[_type == "comment" && postSlug == "${slug}"] | order(_createdAt asc) {
        _id, name, comment, _createdAt, parentComment->{_id, name}
      }
    `);

    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/${SANITY_DATASET}?query=${query}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const comments = data.result || [];
      renderComments(comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }

  // === RENDER COMMENTS ===
  function renderComments(comments) {
    const container = document.getElementById("comment-list");
    if (!container) return;

    // Group comments (replies under parents)
    const grouped = {};
    const roots = [];
    comments.forEach(c => {
      if (c.parentComment?._id) {
        if (!grouped[c.parentComment._id]) grouped[c.parentComment._id] = [];
        grouped[c.parentComment._id].push(c);
      } else {
        roots.push(c);
      }
    });

    container.innerHTML = roots.map(c => renderCommentItem(c, grouped)).join("");
  }

  function renderCommentItem(comment, grouped) {
    const replies = grouped[comment._id] || [];
    const repliesHTML = replies.map(r => renderCommentItem(r, grouped)).join("");

    return `
      <div class="comment-item" data-id="${comment._id}">
        <p><strong>${escapeHtml(comment.name)}</strong></p>
        <p>${escapeHtml(comment.comment)}</p>
        <small>${new Date(comment._createdAt).toLocaleString()}</small>
        <button class="reply-btn">Reply</button>

        <form class="reply-form hidden">
          <input type="text" placeholder="Your name" required />
          <textarea placeholder="Write your reply..." required></textarea>
          <button type="submit">Send Reply</button>
        </form>

        <div class="replies">${repliesHTML}</div>
      </div>
    `;
  }

  function escapeHtml(text = "") {
    return text.replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  // === SETUP MAIN COMMENT FORM ===
  function setupMainForm() {
    const form = document.getElementById("comment-form");
    if (!form) return;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const name = document.getElementById("comment-name").value.trim();
      const comment = document.getElementById("comment-body").value.trim();
      const postSlug = getPostSlug();

      if (!name || !comment) return alert("Please fill in all fields.");

      const payload = { name, comment, postSlug };

      try {
        const res = await fetch(COMMENT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to submit comment");

        alert("✅ Comment submitted!");
        form.reset();
        fetchComments();
      } catch (err) {
        alert("❌ " + err.message);
      }
    });
  }

  // === SETUP REPLY FORMS ===
  function setupReplyForms() {
    document.querySelectorAll(".reply-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const form = btn.nextElementSibling;
        form.classList.toggle("hidden");
      });
    });

    document.querySelectorAll(".reply-form").forEach(form => {
      form.addEventListener("submit", async e => {
        e.preventDefault();

        const parentCommentId = form.closest(".comment-item").dataset.id;
        const name = form.querySelector("input").value.trim();
        const comment = form.querySelector("textarea").value.trim();
        const postSlug = getPostSlug();

        if (!name || !comment) return alert("Please complete all fields.");

        const payload = { name, comment, postSlug, parentCommentId };

        try {
          const res = await fetch(COMMENT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error("Failed to submit reply");

          form.querySelector("input").value = "";
          form.querySelector("textarea").value = "";
          form.classList.add("hidden");

          fetchComments();
        } catch (err) {
          alert("❌ " + err.message);
        }
      });
    });
  }

  // === INIT ===
  async function init() {
    await fetchComments();
    setupMainForm();
    setupReplyForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
