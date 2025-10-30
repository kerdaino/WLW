export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // ✅ Save subscriber to Sanity
    const sanityRes = await fetch(
      `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/${process.env.SANITY_DATASET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
        },
        body: JSON.stringify({
          mutations: [
            {
              create: {
                _type: "subscriber",
                email,
                joinedAt: new Date().toISOString(), // matches schema field
              },
            },
          ],
        }),
      }
    );

    if (!sanityRes.ok) throw new Error("Failed to save email");

    res.status(200).json({ message: "✅ Subscription successful!" });
  } catch (err) {
    console.error("Sanity subscription error:", err);
    res.status(500).json({ message: "❌ Failed to subscribe" });
  }
}
