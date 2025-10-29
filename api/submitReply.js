export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, comment, postSlug, parentComment } = req.body;

    // Validate fields
    if (!name || !comment || !postSlug || !parentComment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_WRITE_TOKEN;

    if (!projectId || !dataset || !token) {
      return res.status(500).json({ error: "Missing Sanity credentials" });
    }

    const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`;

    const mutation = {
      create: {
        _type: "comment",
        name,
        comment,
        postSlug,
        parentComment: { _type: "reference", _ref: parentComment },
        _createdAt: new Date().toISOString(),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations: [mutation] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sanity API error: ${errorText}`);
    }

    const result = await response.json();
    res.status(200).json({ message: "✅ Reply saved successfully!", result });
  } catch (err) {
    console.error("❌ Error saving reply:", err);
    res.status(500).json({ error: err.message });
  }
}
