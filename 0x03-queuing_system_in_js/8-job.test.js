import { expect } from 'chai';
import kue from 'kue';
import sinon from 'sinon';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  let queue;

  beforeEach(() => {
    queue = kue.createQueue();
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.clear();
    queue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs('not an array', queue)).to.throw(
      'Jobs is not an array'
    );
  });

  it('should create jobs in the queue when provided with an array of jobs', () => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
      { phoneNumber: '4153518781', message: 'This is the code 4562 to verify your account' },
    ];

    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
  });

  it('should log job completion and failure events', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
    ];

    const consoleSpy = sinon.spy(console, 'log');

    createPushNotificationsJobs(jobs, queue);

    const job = queue.testMode.jobs[0];

    job._events.complete[0]();

    job._events.failed[0]('Failed to process the job');

    expect(consoleSpy.calledWith(`Notification job ${job.id} completed`)).to.be.true;
    expect(consoleSpy.calledWith(`Notification job ${job.id} failed: Failed to process the job`)).to.be.true;

    consoleSpy.restore();
    done();
  });
});