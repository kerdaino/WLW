// assets/js/comments.js
(function(){

  const SANITY_PROJECT_ID = "cvypf2o3";
  const SANITY_DATASET = "production";
  const NETLIFY_FN = "/.netlify/functions/submitComment";

  // Helper: current post slug
  function getPostSlug() {
    return location.pathname;
  }

  // Fetch all comments and replies
  async function fetchComments() {
    const slug = getPostSlug();
    const query = `
      *[_type == "comment" && postSlug == "${slug}"] | order(_createdAt asc) {
        _id, name, comment, _createdAt, parent->{_id}
      }
    `;
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.result || [];
  }

  // Render all comments and replies (threaded)
  function renderComments(comments) {
    const container = document.querySelector(".comments");
    if (!container) return;

    let list = container.querySelector(".comment-list");
    if (!list) {
      list = document.createElement("div");
      list.className = "comment-list";
      container.appendChild(list);
    }

    // Separate top-level comments and replies
    const topComments = comments.filter(c => !c.parent);
    const repliesMap = {};
    comments.forEach(c => {
      if (c.parent?._id) {
        if (!repliesMap[c.parent._id]) repliesMap[c.parent._id] = [];
        repliesMap[c.parent._id].push(c);
      }
    });

    // Generate HTML
    list.innerHTML = topComments.map(c => renderCommentItem(c, repliesMap)).join("");
  }

  // Render individual comment + nested replies
  function renderCommentItem(comment, repliesMap, isReply = false) {
  const replies = repliesMap[comment._id] || [];
  const repliesHtml = replies.map(r => renderCommentItem(r, repliesMap, true)).join("");

  return `
    <div class="comment-item ${isReply ? "reply-item" : "main-comment"}" data-id="${comment._id}">
      <div class="comment-box">
        <strong>${escapeHtml(comment.name)}</strong>
        <p>${escapeHtml(comment.comment)}</p>
        <small>${new Date(comment._createdAt).toLocaleString()}</small>
        <button class="reply-btn">Reply</button>

        <form class="reply-form hidden">
          <input type="text" placeholder="Your name" required />
          <textarea placeholder="Write a reply..." required></textarea>
          <button type="submit">Reply</button>
        </form>
      </div>

      ${
        replies.length
          ? `<div class="replies"><h4 class="reply-title">Replies:</h4>${repliesHtml}</div>`
          : ""
      }
    </div>
  `;
}


  // Escape HTML
  function escapeHtml(text = "") {
    return text.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  // Handle reply toggle and submission
  function setupReplyForms() {
    document.querySelectorAll(".reply-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const form = btn.nextElementSibling;
        form.classList.toggle("hidden");
      });
    });

    document.querySelectorAll(".reply-form").forEach(form => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const parentId = form.closest(".comment-item").dataset.id;
        const name = form.querySelector("input").value.trim();
        const text = form.querySelector("textarea").value.trim();

        if (!name || !text) return alert("Please complete all fields");

        const payload = {
          name,
          comment: text,
          postSlug: getPostSlug(),
          parentId,
        };

        try {
          const res = await fetch(NETLIFY_FN, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Failed to submit reply");

          // ✅ Instead of alert — auto refresh the comment list
          const comments = await fetchComments();
          renderComments(comments);
          setupReplyForms();

        } catch (err) {
          alert("❌ " + err.message);
        }
      });
    });
  }

  // Handle main comment form
  function setupMainForm() {
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
        setupReplyForms();

      } catch (err) {
        console.error(err);
        successDiv.textContent = "❌ " + err.message;
      }
    });
  }

  async function init() {
    try {
      const comments = await fetchComments();
      renderComments(comments);
      setupReplyForms();
    } catch (err) {
      console.log("Error loading comments", err);
    }

    setupMainForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
