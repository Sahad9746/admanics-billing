const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: 'iapwkj9i',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skbQwhfT9smwFDVElrnTf6K5INKUn3gx79VTu4Cz8jsELRYUNZuy2Xk3yNTDxRZ3NKYXkPZvjMLOQs5YYvu4V5vCs8xwoZHrht9UM9tvsx484cD7qrTFrnRqNA4T6wPspuGjTaFDI7keiAQJSoODC2OT2qDeUPDc2ddhHwrFhTY54PmFWsQX'
});

async function main() {
  const types = ['client', 'invoice', 'transaction', 'wallet', 'project', 'user', 'dailyWorkLog', 'metaAdsReport'];
  const allData = {};

  for (const type of types) {
    const data = await client.fetch(`*[_type == "${type}"]`);
    allData[type] = data;
    console.log(`✅ Fetched ${data.length} ${type} records`);
  }

  fs.writeFileSync('sanity-data.json', JSON.stringify(allData, null, 2));
  console.log('\n✅ All data saved to sanity-data.json');
}

main().catch(console.error);
