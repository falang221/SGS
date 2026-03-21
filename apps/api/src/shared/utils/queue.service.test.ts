describe('QueueService', () => {
  const originalDateNow = Date.now;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    global.Date.now = originalDateNow;
  });

  it('backs off queue reconnect attempts during the cooldown window', async () => {
    let now = 1_000;
    global.Date.now = jest.fn(() => now);

    const add = jest.fn().mockRejectedValue(new Error('redis down'));
    const queueInstance = {
      add,
      close: jest.fn(),
    };

    const warn = jest.fn();
    const info = jest.fn();

    jest.unmock('./queue.service');
    jest.doMock('bullmq', () => ({
      Queue: jest.fn(() => queueInstance),
    }));
    jest.doMock('pino', () => ({
      __esModule: true,
      default: jest.fn(() => ({
        warn,
        info,
      })),
    }));

    const { QueueService } = await import('./queue.service');

    await expect(
      QueueService.addReportJob({
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        studentId: 'student-1',
        period: 'Trimestre 1',
        year: '2024-2025',
      }),
    ).resolves.toBe(false);

    await expect(
      QueueService.addReportJob({
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        studentId: 'student-2',
        period: 'Trimestre 1',
        year: '2024-2025',
      }),
    ).resolves.toBe(false);

    expect(add).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);

    now += 10_001;

    await expect(
      QueueService.addReportJob({
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        studentId: 'student-3',
        period: 'Trimestre 1',
        year: '2024-2025',
      }),
    ).resolves.toBe(false);

    expect(add).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
