const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, comment, postSlug, parentCommentId } = JSON.parse(event.body);

    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_WRITE_TOKEN;

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

    // If it's a reply, add a parent reference
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

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Comment saved", result }),
    };
  } catch (err) {
    console.error("Error saving comment:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
