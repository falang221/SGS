describe('CacheService', () => {
  const originalDateNow = Date.now;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    global.Date.now = originalDateNow;
  });

  it('backs off Redis reconnect attempts during the cooldown window', async () => {
    let now = 1_000;
    global.Date.now = jest.fn(() => now);

    const connect = jest.fn().mockRejectedValue(new Error('redis down'));
    const redisInstance = {
      status: 'end',
      connect,
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      on: jest.fn(),
    };

    const warn = jest.fn();
    const info = jest.fn();

    jest.unmock('./cache.service');
    jest.doMock('ioredis', () => ({
      __esModule: true,
      default: jest.fn(() => redisInstance),
    }));
    jest.doMock('./logger', () => ({
      logger: {
        warn,
        info,
      },
    }));

    const { CacheService } = await import('./cache.service');
    const fetchFn = jest.fn().mockResolvedValue('fresh-value');

    await expect(CacheService.getOrSet('dashboard:stats', fetchFn)).resolves.toBe('fresh-value');
    await expect(CacheService.getOrSet('dashboard:stats', fetchFn)).resolves.toBe('fresh-value');

    expect(connect).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);

    now += 10_001;

    await expect(CacheService.getOrSet('dashboard:stats', fetchFn)).resolves.toBe('fresh-value');

    expect(connect).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
