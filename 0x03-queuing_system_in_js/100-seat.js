const express = require('express');
const redis = require('redis');
const kue = require('kue');
const { promisify } = require('util');

const client = redis.createClient();
const reserveSeat = promisify(client.set).bind(client);
const getCurrentAvailableSeats = promisify(client.get).bind(client);

const queue = kue.createQueue();

const app = express();
const port = 1245;

let reservationEnabled = true;

const initialSeats = 50;
reserveSeat('available_seats', initialSeats);

app.get('/available_seats', async (req, res) => {
  const seats = await getCurrentAvailableSeats('available_seats');
  res.json({ numberOfAvailableSeats: seats });
});

app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (!err) {
      return res.json({ status: 'Reservation in process' });
    } else {
      return res.json({ status: 'Reservation failed' });
    }
  });

  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (errorMessage) => {
    console.log(`Seat reservation job ${job.id} failed: ${errorMessage}`);
  });
});

app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    const seats = await getCurrentAvailableSeats('available_seats');
    let availableSeats = parseInt(seats);

    if (availableSeats > 0) {
      availableSeats -= 1;
      await reserveSeat('available_seats', availableSeats);

      if (availableSeats === 0) {
        reservationEnabled = false;
      }

      done();
    } else {
      done(new Error('Not enough seats available'));
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});