const express = require('express');
const redis = require('redis');
const kue = require('kue');
const { promisify } = require('util');

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const initialSeats = 50;
let reservationEnabled = true;

const queue = kue.createQueue();

const app = express();
const port = 1245;

async function reserveSeat(number) {
  await setAsync('available_seats', number);
}

async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return parseInt(seats) || 0;
}

reserveSeat(initialSeats);

app.get('/available_seats', async (req, res) => {
  const seats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: seats });
});

app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }

  const job = queue.create('reserve_seat', {}).save((err) => {
    if (!err) {
      return res.json({ status: 'Reservation in process' });
    }
    return res.json({ status: 'Reservation failed' });
  });

 
  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  }).on('failed', (err) => {
    console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
  });
});

app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    let seats = await getCurrentAvailableSeats();
    if (seats > 0) {
      seats -= 1;
      await reserveSeat(seats);

      if (seats === 0) {
        reservationEnabled = false;
      }

      done();
    } else {
      done(new Error('Not enough seats available'));
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});