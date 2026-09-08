async function check() {
  try {
    const res = await fetch('http://localhost:5001/api/products?limit=100');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Total products returned:', data.products?.length);
    console.log('Total in response:', data.total);
    const names = data.products?.map(p => p.name);
    console.log('Product names in GET /api/products:');
    console.log(names);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
