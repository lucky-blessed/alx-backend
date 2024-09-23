const express = require('express');
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const listProducts = [
  { id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
  { id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
  { id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
  { id: 4, name: 'Suitcase 1050', price: 550, stock: 5 },
];

function getItemById(id) {
  return listProducts.find((product) => product.id === id);
}

// Function to reserve stock by item ID in Redis
async function reserveStockById(itemId, stock) {
    await setAsync(`item.${itemId}`, stock);
  }
  
  async function getCurrentReservedStockById(itemId) {
    const stock = await getAsync(`item.${itemId}`);
    return stock ? parseInt(stock) : null;
  }

  const app = express();
const PORT = 1245;

// Route to list all products
app.get('/list_products', (req, res) => {
  const products = listProducts.map(product => ({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
  }));
  res.json(products);
});

// Route to get details of a specific product
app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const currentQuantity = product.stock - (reservedStock || 0);

  res.json({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
    currentQuantity,
  });
});

// Route to reserve a product by ID
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const currentQuantity = product.stock - (reservedStock || 0);

  if (currentQuantity <= 0) {
    return res.status(400).json({
      status: 'Not enough stock available',
      itemId: product.id,
    });
  }

  await reserveStockById(itemId, (reservedStock || 0) + 1);

  res.json({
    status: 'Reservation confirmed',
    itemId: product.id,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  