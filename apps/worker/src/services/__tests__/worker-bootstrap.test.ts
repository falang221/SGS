const createConnectionMock = jest.fn();
const workerMock = jest.fn();
const loggerWarn = jest.fn();
const loggerInfo = jest.fn();
const socketHandlers = new Map<string, (...args: unknown[]) => void>();

jest.mock('node:net', () => ({
  __esModule: true,
  default: {
    createConnection: (...args: unknown[]) => createConnectionMock(...args),
  },
}));

jest.mock('bullmq', () => ({
  Worker: jest.fn((...args: unknown[]) => workerMock(...args)),
}));

jest.mock('pino', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    warn: loggerWarn,
    info: loggerInfo,
    error: jest.fn(),
  })),
}));

jest.mock('../..//process-report', () => ({
  processReportJob: jest.fn(),
}));

function createMockSocket() {
  return {
    setTimeout: jest.fn(),
    once: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      socketHandlers.set(event, handler);
      return undefined;
    }),
    removeAllListeners: jest.fn(),
    destroy: jest.fn(),
  };
}

describe('startReportWorker', () => {
  beforeEach(() => {
    jest.resetModules();
    socketHandlers.clear();
    createConnectionMock.mockReset();
    workerMock.mockReset();
    loggerWarn.mockReset();
    loggerInfo.mockReset();
  });

  it('laisse le worker en veille si Redis est indisponible', async () => {
    const socket = createMockSocket();
    createConnectionMock.mockReturnValue(socket);

    const { startReportWorker } = await import('../../index');
    const promise = startReportWorker();

    const errorHandler = socketHandlers.get('error');
    expect(errorHandler).toBeDefined();
    errorHandler?.(new Error('redis down'));

    await expect(promise).resolves.toBeNull();
    expect(workerMock).not.toHaveBeenCalled();
    expect(loggerWarn).toHaveBeenCalledWith('Redis indisponible, worker de bulletins lancé en veille');
  });
});
