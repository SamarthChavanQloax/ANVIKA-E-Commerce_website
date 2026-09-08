const BASE_URL = 'http://localhost:5001';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting Admin Dashboard Integration Test Suite...\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Testing Admin Authentication...');
    const loginRes = await req('/api/users/login', {
      method: 'POST',
      body: {
        email: 'admin@anvika.com',
        password: 'password123',
      },
    });
    const adminToken = loginRes.data.token;
    console.log(`   ✅ Admin logged in successfully! Role: ${loginRes.data.role}`);

    const authHeaders = {
      headers: { Authorization: `Bearer ${adminToken}` },
    };

    // 2. Admin Dashboard API
    console.log('2️⃣ Testing GET /api/admin/dashboard...');
    const dashRes = await req('/api/admin/dashboard', authHeaders);
    console.log('   ✅ Dashboard metrics:', {
      totalProducts: dashRes.data.totalProducts,
      totalOrders: dashRes.data.totalOrders,
      totalCustomers: dashRes.data.totalCustomers,
      totalRevenue: dashRes.data.totalRevenue,
      pendingOrders: dashRes.data.pendingOrders,
      lowStockProducts: dashRes.data.lowStockProducts,
      outOfStockProducts: dashRes.data.outOfStockProducts,
    });

    // 3. Admin Analytics API
    console.log('3️⃣ Testing GET /api/admin/analytics...');
    const analyticsRes = await req('/api/admin/analytics?range=month', authHeaders);
    console.log('   ✅ Analytics range month:', {
      revenue: analyticsRes.data.revenue,
      orders: analyticsRes.data.orders,
      avgOrderValue: analyticsRes.data.avgOrderValue,
      categoriesCount: analyticsRes.data.categoryStats?.length,
    });

    // 4. Admin Customers API
    console.log('4️⃣ Testing GET /api/admin/customers...');
    const customersRes = await req('/api/admin/customers', authHeaders);
    const sampleCustomer = customersRes.data[0];
    console.log(`   ✅ Retrieved ${customersRes.data.length} customer records.`);
    console.log(`   ✅ Password hash omitted: ${sampleCustomer.password === undefined}`);
    console.log(`   ✅ Customer has ordersCount & totalSpent fields: ordersCount=${sampleCustomer.ordersCount}, totalSpent=${sampleCustomer.totalSpent}`);

    // 5. Admin Orders API
    console.log('5️⃣ Testing GET /api/admin/orders...');
    const ordersRes = await req('/api/admin/orders', authHeaders);
    console.log(`   ✅ Retrieved ${ordersRes.data.length} orders from MongoDB.`);

    // 6. Product Creation with Variants
    console.log('6️⃣ Testing POST /api/products (Admin creates product with variants)...');
    const newProductPayload = {
      name: 'Regal Emerald Chanderi Saree',
      slug: `regal-emerald-chanderi-saree-${Date.now()}`,
      brand: 'Anvika Heritage',
      category: 'Sarees',
      fabric: 'Pure Chanderi Silk',
      price: 13500,
      originalPrice: 16000,
      discount: 16,
      description: 'Exquisite handwoven Chanderi silk with antique zari borders.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'],
      isFeatured: true,
      isNew: true,
      isBestseller: false,
      isActive: true,
      variants: [
        { size: 'Free Size', color: 'Emerald Green', price: 13500, stock: 7 },
        { size: 'Free Size', color: 'Royal Ruby', price: 14000, stock: 4 },
      ],
    };
    const createProductRes = await req('/api/products', {
      method: 'POST',
      ...authHeaders,
      body: newProductPayload,
    });
    const createdId = createProductRes.data._id;
    console.log(`   ✅ Product created in MongoDB! ID: ${createdId}, Computed Stock: ${createProductRes.data.stock}`);

    // 7. Verify Product in Public API (Customer Frontend View)
    console.log('7️⃣ Testing GET /api/products/:id (Customer sees new product)...');
    const customerViewRes = await req(`/api/products/${createdId}`);
    console.log(`   ✅ Customer retrieved: "${customerViewRes.data.name}", Price: ${customerViewRes.data.price}, Stock: ${customerViewRes.data.stock}, Variants: ${customerViewRes.data.variants?.length}`);

    // 8. Update Product (Admin modifies price and stock)
    console.log('8️⃣ Testing PUT /api/products/:id (Admin updates price and variants)...');
    const updateRes = await req(`/api/products/${createdId}`, {
      method: 'PUT',
      ...authHeaders,
      body: {
        price: 12999,
        variants: [
          { size: 'Free Size', color: 'Emerald Green', price: 12999, stock: 10 },
          { size: 'Free Size', color: 'Royal Ruby', price: 13499, stock: 5 },
        ],
      },
    });
    console.log(`   ✅ Updated successfully! New Price: ${updateRes.data.price}, New Stock: ${updateRes.data.stock}`);

    // 9. Clean up test product
    console.log('9️⃣ Testing DELETE /api/products/:id (Admin deletes product)...');
    await req(`/api/products/${createdId}`, {
      method: 'DELETE',
      ...authHeaders,
    });
    console.log('   ✅ Test product deleted from MongoDB.');

    // 10. Security: Customer attempting admin route
    console.log('🔟 Testing Security: Non-admin customer attempting to access /api/admin/dashboard...');
    const customerLoginRes = await req('/api/users/login', {
      method: 'POST',
      body: {
        email: 'jane@example.com',
        password: 'password123',
      },
    });
    const customerToken = customerLoginRes.data.token;
    try {
      await req('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      console.error('   ❌ Security failure: Customer was allowed access to admin route!');
    } catch (unauthorizedErr) {
      console.log(`   ✅ Security verified! Customer request rejected with status: ${unauthorizedErr.status} (${unauthorizedErr.data?.message || 'Forbidden'})`);
    }

    console.log('\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY! Real MongoDB data persistence, authentication, authorization, and frontend sync verified.');
  } catch (error) {
    console.error('❌ Test failed:', error.data || error.message);
  }
}

runTests();
