// assets/js/comments.js
(function(){

  const SANITY_PROJECT_ID = "cvypf2o3"; // ✅ Your project ID
  const SANITY_DATASET = "production";
  const NETLIFY_FN = "/.netlify/functions/submitComment";

  // Helper to get slug from current URL
  function getPostSlug() {
    return location.pathname; // ex: /frontrow/love-letter.html
  }

  async function fetchComments() {
    const slug = getPostSlug();
    const query = `*[_type == "comment" && postSlug == "${slug}" && !defined(parentComment)] | order(_createdAt desc){_id, name, comment, _createdAt}`;
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const json = await res.json();
    return json.result || [];
  }

  // ✅ UPDATED renderComments — now includes "Reply" buttons and reply forms
  function renderComments(comments) {
    const container = document.querySelector(".comments");
    if (!container) return;

    let list = container.querySelector(".comment-list");
    if (!list) {
      list = document.createElement("div");
      list.className = "comment-list";
      container.appendChild(list);
    }

    list.innerHTML = comments.map(c => `
      <div class="comment-item" data-id="${c._id}">
        <strong>${escapeHtml(c.name)}</strong>
        <p>${escapeHtml(c.comment)}</p>
        <small>${new Date(c._createdAt).toLocaleString()}</small>
        <button class="reply-btn">Reply</button>
        <div class="reply-form hidden">
          <input type="text" placeholder="Your name" class="reply-name" />
          <textarea placeholder="Your reply" class="reply-text"></textarea>
          <button class="reply-submit">Post Reply</button>
        </div>
        <div class="replies"></div>
      </div>
    `).join("");

    setupReplyHandlers();
  }

  // ✅ Helper for safe text
  function escapeHtml(text = "") {
    return text.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  // ✅ Handles reply button clicks and reply submissions
  function setupReplyHandlers() {
    document.querySelectorAll(".reply-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const form = btn.nextElementSibling;
        form.classList.toggle("hidden");
      });
    });

    document.querySelectorAll(".reply-submit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentItem = btn.closest(".comment-item");
        const parentId = commentItem.getAttribute("data-id");
        const name = commentItem.querySelector(".reply-name").value.trim();
        const reply = commentItem.querySelector(".reply-text").value.trim();

        if (!name || !reply) return alert("Please fill in all fields");

        try {
          const res = await fetch("/.netlify/functions/submitReply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              comment: reply,
              postSlug: getPostSlug(),
              parentComment: parentId,
            }),
          });

          if (res.ok) {
            alert("✅ Reply posted!");
            const comments = await fetchComments();
            renderComments(comments);
          } else {
            alert("❌ Failed to post reply");
          }
        } catch (err) {
          alert("⚠️ " + err.message);
        }
      });
    });
  }

  // ✅ Original form setup (for top-level comments)
  function setupForm() {
    const form = document.querySelector(".comments form.align");
    if (!form) return;

    const successDiv = document.createElement("div");
    successDiv.className = "comment-message";
    form.appendChild(successDiv);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector("input[type='text']");
      const textarea = form.querySelector("textarea");

      const payload = {
        name: nameInput.value.trim(),
        comment: textarea.value.trim(),
        postSlug: getPostSlug(),
      };

      if (!payload.name || !payload.comment)
        return alert("Please complete all fields");

      try {
        const res = await fetch(NETLIFY_FN, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to submit comment");

        nameInput.value = "";
        textarea.value = "";
        successDiv.textContent = "✅ Comment submitted successfully!";

        const comments = await fetchComments();
        renderComments(comments);

      } catch (err) {
        console.error(err);
        successDiv.textContent = "❌ " + err.message;
      }
    });
  }

  // ✅ Initialization
  async function init() {
    try {
      const comments = await fetchComments();
      renderComments(comments);
    } catch (err) {
      console.log("Error loading comments", err);
    }

    setupForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
