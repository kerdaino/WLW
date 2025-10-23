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
    const query = `*[_type == "comment" && postSlug == "${slug}"] | order(_createdAt desc){name, comment, _createdAt}`;
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const json = await res.json();
    return json.result || [];
  }

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
      <div class="comment-item">
        <strong>${escapeHtml(c.name)}</strong>
        <p>${escapeHtml(c.comment)}</p>
        <small>${new Date(c._createdAt).toLocaleString()}</small>
      </div>
    `).join("");
  }

  function escapeHtml(text = "") {
    return text.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

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
