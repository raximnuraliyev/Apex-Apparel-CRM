const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('./models/User');
const Client = require('./models/Client');
const Order = require('./models/Order');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear all collections
    await User.deleteMany({});
    await Client.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data.');

    // Create default user
    const user = await User.create({
      username: 'Alex Wilkerson',
      email: 'staff@apex.com',
      password: 'apexpassword',
      role: 'Wholesale Lead',
    });
    console.log(`Created user: ${user.username} (${user.email})`);

    // Create clients
    const clientsData = [
      {
        company: 'Pacific Coast Outfitters',
        name: 'Sarah Jenkins',
        email: 'sarah@pacificcoast.com',
        phone: '(503) 555-0142',
        tier: 'Platinum',
        status: 'Active',
        totalOrders: 28,
        totalSpend: 142500,
      },
      {
        company: 'The Brooklyn Wardrobe',
        name: 'Marcus Vance',
        email: 'marcus@brooklynwardrobe.com',
        phone: '(718) 555-0198',
        tier: 'Gold',
        status: 'Active',
        totalOrders: 19,
        totalSpend: 84300,
      },
      {
        company: 'Thread & Needle Co.',
        name: 'Helena Rostova',
        email: 'helena@threadneedle.com',
        phone: '(415) 555-0167',
        tier: 'Gold',
        status: 'Active',
        totalOrders: 12,
        totalSpend: 54000,
      },
      {
        company: 'Nordstrom Group (Wholesale)',
        name: 'Edward Pierce',
        email: 'epierce@nordstrom.com',
        phone: '(206) 555-0234',
        tier: 'Platinum',
        status: 'Active',
        totalOrders: 42,
        totalSpend: 312000,
      },
      {
        company: 'Stitch Collective',
        name: 'Chloe Beaulieu',
        email: 'chloe@stitchcollective.com',
        phone: '(514) 555-0189',
        tier: 'Silver',
        status: 'Pending Approval',
        totalOrders: 8,
        totalSpend: 24700,
      },
      {
        company: 'Velvet & Co. Boutiques',
        name: 'Alessia Moretti',
        email: 'alessia@velvetco.com',
        phone: '(212) 555-0156',
        tier: 'Silver',
        status: 'Active',
        totalOrders: 5,
        totalSpend: 18450,
      },
      {
        company: 'Apex Luxe Retailers',
        name: 'Derrick Vance',
        email: 'derrick@apexluxe.com',
        phone: '(310) 555-0178',
        tier: 'Bronze',
        status: 'Inactive',
        totalOrders: 2,
        totalSpend: 9800,
      },
    ];

    const clients = await Client.insertMany(clientsData);
    console.log(`Created ${clients.length} clients.`);

    // Map clients by company name for easy reference
    const clientMap = {};
    clients.forEach((c) => {
      clientMap[c.company] = c;
    });

    // Create orders with proper clientId references
    const ordersData = [
      {
        orderNumber: 'APX-9582',
        clientId: clientMap['Pacific Coast Outfitters']._id,
        clientName: 'Sarah Jenkins',
        companyName: 'Pacific Coast Outfitters',
        status: 'Processing',
        totalAmount: 18400,
        items: [
          { name: 'Heavyweight Fleece Hoodies', qty: 150, price: 60 },
          { name: 'Pima Cotton Tees', qty: 40, price: 110 },
          { name: 'Premium Denim Slim-Fit Jeans', qty: 100, price: 50 },
        ],
      },
      {
        orderNumber: 'APX-9583',
        clientId: clientMap['Nordstrom Group (Wholesale)']._id,
        clientName: 'Edward Pierce',
        companyName: 'Nordstrom Group (Wholesale)',
        status: 'Pending',
        totalAmount: 42500,
        items: [
          { name: 'Tech Shell Jackets', qty: 250, price: 120 },
          { name: 'Merino Wool Sweaters', qty: 125, price: 100 },
        ],
      },
      {
        orderNumber: 'APX-9578',
        clientId: clientMap['The Brooklyn Wardrobe']._id,
        clientName: 'Marcus Vance',
        companyName: 'The Brooklyn Wardrobe',
        status: 'Shipped',
        totalAmount: 12600,
        items: [
          { name: 'Organic Linen Button-Ups', qty: 120, price: 45 },
          { name: 'Chino Trousers', qty: 120, price: 60 },
        ],
        shippingCarrier: 'UPS Ground',
        trackingNumber: '1Z999XX10123456784',
      },
      {
        orderNumber: 'APX-9579',
        clientId: clientMap['Thread & Needle Co.']._id,
        clientName: 'Helena Rostova',
        companyName: 'Thread & Needle Co.',
        status: 'Pending',
        totalAmount: 8400,
        items: [
          { name: 'Oversized Graphic Sweatshirts', qty: 140, price: 60 },
        ],
      },
      {
        orderNumber: 'APX-9580',
        clientId: clientMap['Velvet & Co. Boutiques']._id,
        clientName: 'Alessia Moretti',
        companyName: 'Velvet & Co. Boutiques',
        status: 'Processing',
        totalAmount: 5120,
        items: [
          { name: 'Silk Slip Dresses', qty: 40, price: 80 },
          { name: 'Tailored Blazer Vests', qty: 24, price: 80 },
        ],
        shippingCarrier: 'DHL Express',
      },
      {
        orderNumber: 'APX-9575',
        clientId: clientMap['Pacific Coast Outfitters']._id,
        clientName: 'Sarah Jenkins',
        companyName: 'Pacific Coast Outfitters',
        status: 'Shipped',
        totalAmount: 15400,
        items: [
          { name: 'French Terry Shorts', qty: 200, price: 40 },
          { name: 'Premium Heavyweight Boxy Tees', qty: 200, price: 37 },
        ],
        shippingCarrier: 'FedEx Ground',
        trackingNumber: '891048123910',
      },
      {
        orderNumber: 'APX-9576',
        clientId: clientMap['Apex Luxe Retailers']._id,
        clientName: 'Derrick Vance',
        companyName: 'Apex Luxe Retailers',
        status: 'Cancelled',
        totalAmount: 9800,
        items: [
          { name: 'Cashmere Ribbed Cardigans', qty: 49, price: 200 },
        ],
      },
    ];

    const orders = await Order.insertMany(ordersData);
    console.log(`Created ${orders.length} orders.`);

    console.log('\n--- Seed Complete ---');
    console.log('Login credentials:');
    console.log('  Email:    staff@apex.com');
    console.log('  Password: apexpassword');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
