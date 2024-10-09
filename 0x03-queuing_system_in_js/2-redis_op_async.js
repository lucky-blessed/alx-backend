import { createClient } from "redis";
import { print } from 'redis';
import { promisify } from 'util';

const client = createClient();

client.on_connect('connect', () => {
    console.log('Redis client connected to the server');
});

client.on('error', (err) => {
    console.log('Redis client not connected to the server:', err.message);
});

function setNewSchool(schoolName, value) {
    client.set(schoolName, value, print);
}

const getAsync = promisify(client.get).bind(client);

async function displaySchoolValue(schoolName) {
    try {
        const value = await getAsync(schoolName);
        console.log(value);
    } catch (err) {
        console.error('Error retrieving the value', err);
    }
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');