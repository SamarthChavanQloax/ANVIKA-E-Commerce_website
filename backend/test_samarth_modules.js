const BASE_URL = 'http://localhost:5001';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting automated verification for Samarth modules...\n');
  const timestamp = Date.now();
  const testUser = {
    name: `Samarth Tester ${timestamp}`,
    email: `tester_${timestamp}@anvika.com`,
    password: 'securePassword123',
    phone: '9876543210',
  };

  let token = '';
  let createdAddressId1 = '';
  let createdAddressId2 = '';
  let sampleProductId = '';
  let sampleProductPrice = 0;
  let cartItemId = '';

  try {
    // 1. Register
    console.log('1️⃣ Testing POST /api/auth/register...');
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: testUser,
    });
    if (regRes.status === 201 && regRes.data.token && !regRes.data.password) {
      token = regRes.data.token;
      console.log('   ✅ Registration passed. Token received, password omitted.');
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }

    // 2. Login
    console.log('2️⃣ Testing POST /api/auth/login...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    if (loginRes.status === 200 && loginRes.data.token && !loginRes.data.password) {
      token = loginRes.data.token;
      console.log('   ✅ Login passed. Token verified.');
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 3. GET /api/auth/me
    console.log('3️⃣ Testing GET /api/auth/me...');
    const meRes = await request('/api/auth/me', {
      method: 'GET',
      ...authHeaders,
    });
    if (meRes.status === 200 && meRes.data.email === testUser.email && !meRes.data.password) {
      console.log('   ✅ /api/auth/me passed. User identity verified.');
    } else {
      throw new Error('/api/auth/me failed');
    }

    // 4. User Profile GET & PUT
    console.log('4️⃣ Testing GET & PUT /api/users/profile...');
    const profileRes = await request('/api/users/profile', {
      method: 'GET',
      ...authHeaders,
    });
    if (profileRes.status !== 200) throw new Error('GET /api/users/profile failed');

    const updateProfileRes = await request('/api/users/profile', {
      method: 'PUT',
      ...authHeaders,
      body: {
        name: 'Samarth Updated Name',
        phone: '9123456780',
        gender: 'female',
      },
    });
    if (
      updateProfileRes.status === 200 &&
      updateProfileRes.data.name === 'Samarth Updated Name' &&
      updateProfileRes.data.phone === '9123456780' &&
      !updateProfileRes.data.password
    ) {
      console.log('   ✅ Profile GET & PUT passed. Profile updated without password leak.');
    } else {
      throw new Error(`PUT /api/users/profile failed: ${JSON.stringify(updateProfileRes.data)}`);
    }

    // 5. Addresses CRUD
    console.log('5️⃣ Testing Address CRUD /api/users/addresses...');
    // Add Address 1 (should automatically be default as first address)
    const addr1Res = await request('/api/users/addresses', {
      method: 'POST',
      ...authHeaders,
      body: {
        fullName: 'Samarth Home',
        phone: '9876543210',
        addressLine: '123 Heritage Lane, 4th Floor',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
    });
    createdAddressId1 = addr1Res.data._id;
    if (addr1Res.status === 201 && addr1Res.data.isDefault === true) {
      console.log('   ✅ Address 1 created as default.');
    } else {
      throw new Error(`Address 1 creation failed: ${JSON.stringify(addr1Res.data)}`);
    }

    // Add Address 2 as default (Address 1 should lose default)
    const addr2Res = await request('/api/users/addresses', {
      method: 'POST',
      ...authHeaders,
      body: {
        fullName: 'Samarth Office',
        phone: '9876543211',
        addressLine: '456 Business Park',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India',
        isDefault: true,
      },
    });
    createdAddressId2 = addr2Res.data._id;
    if (addr2Res.status === 201 && addr2Res.data.isDefault === true) {
      console.log('   ✅ Address 2 created as default.');
    } else {
      throw new Error(`Address 2 creation failed: ${JSON.stringify(addr2Res.data)}`);
    }

    // Check GET addresses
    const allAddrRes = await request('/api/users/addresses', {
      method: 'GET',
      ...authHeaders,
    });
    const addr1InList = allAddrRes.data.find((a) => a._id === createdAddressId1);
    const addr2InList = allAddrRes.data.find((a) => a._id === createdAddressId2);
    if (addr1InList && addr2InList && addr1InList.isDefault === false && addr2InList.isDefault === true) {
      console.log('   ✅ Default toggling verified: Address 1 isDefault=false, Address 2 isDefault=true.');
    } else {
      throw new Error('Default address toggling check failed');
    }

    // Update Address 1
    const updateAddrRes = await request(`/api/users/addresses/${createdAddressId1}`, {
      method: 'PUT',
      ...authHeaders,
      body: {
        city: 'Navi Mumbai',
      },
    });
    if (updateAddrRes.data.city === 'Navi Mumbai') {
      console.log('   ✅ Address update passed.');
    } else {
      throw new Error('Address update failed');
    }

    // Delete Address 2
    const delAddrRes = await request(`/api/users/addresses/${createdAddressId2}`, {
      method: 'DELETE',
      ...authHeaders,
    });
    if (delAddrRes.status === 200) {
      console.log('   ✅ Address delete passed.');
    } else {
      throw new Error('Address delete failed');
    }

    // 6. Get a product from Piyush's module to test Cart & Wishlist
    console.log('6️⃣ Fetching sample product from /api/products...');
    const prodRes = await request('/api/products');
    const products = prodRes.data.products || prodRes.data;
    if (Array.isArray(products) && products.length > 0) {
      sampleProductId = products[0]._id;
      sampleProductPrice = products[0].price;
      console.log(`   ✅ Sample product retrieved: "${products[0].name}" (ID: ${sampleProductId}, Price: ₹${sampleProductPrice})`);
    } else {
      throw new Error('No products found in DB to test cart/wishlist');
    }

    // 7. Cart APIs (MongoDB backed)
    console.log('7️⃣ Testing Cart APIs /api/cart...');
    // Add to cart with client-supplied price 1 (to verify backend ignores client price and uses DB product price)
    const addCartRes = await request('/api/cart', {
      method: 'POST',
      ...authHeaders,
      body: {
        productId: sampleProductId,
        quantity: 2,
        variant: { size: 'Free Size' },
        price: 1, // Fake client price
      },
    });

    if (addCartRes.status === 200 && addCartRes.data.items && addCartRes.data.items.length > 0) {
      const addedItem = addCartRes.data.items[0];
      cartItemId = addedItem._id;
      if (addedItem.price === sampleProductPrice) {
        console.log(`   ✅ Cart Price Snapshot verified: Used DB price ₹${sampleProductPrice} instead of client price ₹1.`);
      } else {
        throw new Error(`Cart price snapshot failed: expected ₹${sampleProductPrice}, got ₹${addedItem.price}`);
      }

      if (addCartRes.data.subtotal === sampleProductPrice * 2) {
        console.log(`   ✅ Cart Subtotal verified: ₹${addCartRes.data.subtotal} (₹${sampleProductPrice} × 2).`);
      } else {
        throw new Error(`Subtotal mismatch: got ${addCartRes.data.subtotal}`);
      }
    } else {
      throw new Error(`POST /api/cart failed: ${JSON.stringify(addCartRes.data)}`);
    }

    // Update quantity
    const updateCartRes = await request(`/api/cart/${cartItemId}`, {
      method: 'PUT',
      ...authHeaders,
      body: { quantity: 3 },
    });
    if (
      updateCartRes.data.items &&
      updateCartRes.data.items[0].quantity === 3 &&
      updateCartRes.data.subtotal === sampleProductPrice * 3
    ) {
      console.log(`   ✅ Cart Item update passed: quantity updated to 3, subtotal updated to ₹${updateCartRes.data.subtotal}.`);
    } else {
      throw new Error(`PUT /api/cart/:itemId failed: ${JSON.stringify(updateCartRes.data)}`);
    }

    // Clear cart
    const clearCartRes = await request('/api/cart', {
      method: 'DELETE',
      ...authHeaders,
    });
    if (clearCartRes.status === 200 && clearCartRes.data.items && clearCartRes.data.items.length === 0) {
      console.log('   ✅ Cart clear passed.');
    } else {
      throw new Error('DELETE /api/cart failed');
    }

    // 8. Wishlist APIs (MongoDB backed)
    console.log('8️⃣ Testing Wishlist APIs /api/wishlist...');
    const addWishRes1 = await request(`/api/wishlist/${sampleProductId}`, {
      method: 'POST',
      ...authHeaders,
    });
    if (addWishRes1.status === 200 && Array.isArray(addWishRes1.data) && addWishRes1.data.some((p) => p._id === sampleProductId)) {
      console.log('   ✅ Added to wishlist.');
    } else {
      throw new Error(`POST /api/wishlist failed: ${JSON.stringify(addWishRes1.data)}`);
    }

    // Add duplicate product to wishlist -> should not duplicate
    const addWishRes2 = await request(`/api/wishlist/${sampleProductId}`, {
      method: 'POST',
      ...authHeaders,
    });
    const countOccurrences = addWishRes2.data.filter((p) => p._id === sampleProductId).length;
    if (countOccurrences === 1) {
      console.log('   ✅ Wishlist duplicate prevention verified (exact 1 occurrence).');
    } else {
      throw new Error(`Duplicate prevention failed: found ${countOccurrences} occurrences`);
    }

    // Test frontend catalog ID (e.g. prod_99)
    console.log('   Testing frontend catalog ID (e.g. prod_99) in Wishlist...');
    const addCatalogWish = await request('/api/wishlist/prod_99', {
      method: 'POST',
      ...authHeaders,
      body: {
        product: {
          _id: 'prod_99',
          name: 'Royal Heritage Brocade Ensemble',
          price: 24500,
          image: '/products/saree-silver-silk.jpg',
          category: 'Sarees',
        }
      }
    });
    if (addCatalogWish.status === 200 && Array.isArray(addCatalogWish.data) && addCatalogWish.data.some(p => p._id === 'prod_99')) {
      console.log('   ✅ Frontend catalog ID (prod_99) saved and retrieved successfully without CastError!');
    } else {
      throw new Error(`Catalog wishlist failed: ${JSON.stringify(addCatalogWish.data)}`);
    }

    // Remove catalog product
    await request('/api/wishlist/prod_99', {
      method: 'DELETE',
      ...authHeaders,
    });

    // GET wishlist
    const getWishRes = await request('/api/wishlist', {
      method: 'GET',
      ...authHeaders,
    });
    if (getWishRes.status === 200 && Array.isArray(getWishRes.data) && getWishRes.data.length >= 1) {
      console.log('   ✅ GET /api/wishlist passed.');
    } else {
      throw new Error('GET /api/wishlist failed');
    }

    // Remove from wishlist
    const remWishRes = await request(`/api/wishlist/${sampleProductId}`, {
      method: 'DELETE',
      ...authHeaders,
    });
    const stillInWishlist = Array.isArray(remWishRes.data) && remWishRes.data.some((p) => p._id === sampleProductId);
    if (!stillInWishlist) {
      console.log('   ✅ Wishlist remove passed.');
    } else {
      throw new Error('DELETE /api/wishlist failed');
    }

    // 9. Logout
    console.log('9️⃣ Testing POST /api/auth/logout...');
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
    });
    if (logoutRes.status === 200) {
      console.log('   ✅ Logout passed.');
    } else {
      throw new Error('POST /api/auth/logout failed');
    }

    console.log('\n🎉 ALL 9 MODULE TESTS PASSED FLAWLESSLY! 🎉\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
