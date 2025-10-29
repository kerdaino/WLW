// api/submitcomment.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "✅ submitcomment route is working!" });
  }

  try {
    const { name, comment, postSlug, parentCommentId } = req.body;

    if (!name || !comment || !postSlug) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_WRITE_TOKEN;

    if (!projectId || !dataset || !token) {
      return res.status(500).json({ message: "Missing Sanity credentials" });
    }

    const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`;

    const mutation = {
      create: {
        _type: "comment",
        name,
        comment,
        postSlug,
        _createdAt: new Date().toISOString(),
      },
    };

    // Add parent reference if this is a reply
    if (parentCommentId) {
      mutation.create.parentComment = { _type: "reference", _ref: parentCommentId };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations: [mutation] }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Sanity API error: ${text}`);
    }

    const result = await response.json();
    res.status(200).json({ message: "✅ Comment saved successfully!", result });
  } catch (err) {
    console.error("❌ Error saving comment:", err);
    res.status(500).json({ error: err.message });
  }
}
