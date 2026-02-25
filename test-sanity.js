require('dotenv').config({ path: '.env.local' });
const { createClient } = require('next-sanity');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  const data = await client.fetch('*[_type == "user"]{name, email, role}');
  console.log(JSON.stringify(data, null, 2));
}

run();
