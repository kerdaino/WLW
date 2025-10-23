const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, comment, postSlug, parentComment } = JSON.parse(event.body);
    if (!name || !comment || !postSlug || !parentComment) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET;
    const token = process.env.SANITY_WRITE_TOKEN;

    const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`;

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
              parentComment: { _type: "reference", _ref: parentComment },
              createdAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify({ message: "Reply saved", result }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
