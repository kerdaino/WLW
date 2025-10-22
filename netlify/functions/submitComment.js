// netlify/functions/submitComment.js

const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { name, text, postSlug } = JSON.parse(event.body || "{}");

  if (!name || !text || !postSlug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing fields" }),
    };
  }

  const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
  const SANITY_DATASET = process.env.SANITY_DATASET || "production";
  const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

  const mutateURL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}`;

  const doc = {
    _type: "comment",
    name,
    text,
    postSlug,
    publishedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(mutateURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({
        mutations: [{ create: doc }],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
