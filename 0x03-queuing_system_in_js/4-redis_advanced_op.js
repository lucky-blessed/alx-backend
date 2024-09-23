import redis from 'redis';

// Create a Redis client
const client = redis.createClient();

// Handle connection success
client.on('connect', () => {
    console.log('Redis client connected to the server');
});

// Handle connection error
client.on('error', (err) => {
    console.log(`Redis client not connected to the server: ${err.message}`);
});

// Create a hash in Redis using hset for different schools and their values
client.hset('HolbertonSchools', 'Portland', 50, redis.print);
client.hset('HolbertonSchools', 'Seattle', 80, redis.print);
client.hset('HolbertonSchools', 'New York', 20, redis.print);
client.hset('HolbertonSchools', 'Bogota', 20, redis.print);
client.hset('HolbertonSchools', 'Cali', 40, redis.print);
client.hset('HolbertonSchools', 'Paris', 2, redis.print);

client.hgetall('HolbertonSchools', (err, result) => {
    if (err) {
        console.error('Error retrieving hash:', err);
    } else {
        console.log(result);
    }
});
