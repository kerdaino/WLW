// netlify/functions/submitComment.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, comment, postSlug } = JSON.parse(event.body);

    if (!name || !comment || !postSlug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // ✅ Sanity project details (from Netlify environment variables)
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_WRITE_TOKEN;

    const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`;

    // ✅ Create a comment with postSlug
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: "comment",
              name,
              comment,
              postSlug,
              createdAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    const result = await response.json();
    console.log("✅ Comment saved:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Comment saved", result }),
    };
  } catch (err) {
    console.error("❌ Error saving comment:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
