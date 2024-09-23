import { expect } from 'chai';
import kue from 'kue';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', function () {
  let queue;

  beforeEach(() => {
    queue = kue.createQueue();
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.clear();
    queue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', function () {
    expect(() => createPushNotificationsJobs('not an array', queue)).to.throw('Jobs is not an array');
  });

  it('should create jobs for valid job data', function () {
    const jobs = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account'
      },
      {
        phoneNumber: '4153518781',
        message: 'This is the code 4562 to verify your account'
      }
    ];

    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(2);

    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.eql({
      phoneNumber: '4153518780',
      message: 'This is the code 1234 to verify your account'
    });

    expect(queue.testMode.jobs[1].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[1].data).to.eql({
      phoneNumber: '4153518781',
      message: 'This is the code 4562 to verify your account'
    });
  });

  it('should log job creation, completion, failure, and progress', function (done) {
    const jobs = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account'
      }
    ];

    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(1);

    const job = queue.testMode.jobs[0];

    job.on('enqueue', () => {
      console.log(`Notification job created: ${job.id}`);
    });

    job.on('complete', () => {
      console.log(`Notification job ${job.id} completed`);
      done();
    });

    job.on('failed', (err) => {
      console.log(`Notification job ${job.id} failed: ${err}`);
      done(err);
    });

    job.on('progress', (progress) => {
      console.log(`Notification job ${job.id} ${progress}% complete`);
    });

    job.complete();
  });
});