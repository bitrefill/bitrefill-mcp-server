import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpServerManager } from './McpServerManager';
import { IMcpServerInstance, TransportConfig } from '../shared/types';
import { ExpressServer } from '../ExpressServer';
import * as serverRegistryModule from '../config/serverRegistry';

// Mock ExpressServer
vi.mock('../ExpressServer', () => ({
  ExpressServer: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    getTransport: vi.fn(),
  })),
}));

// Mock server registry to be empty by default
vi.mock('../config/serverRegistry', () => ({
  serverRegistry: []
}));

// Mock MCP server instance
class MockMcpServer implements IMcpServerInstance {
  #running = false;
  #startMock = vi.fn().mockImplementation(async () => { this.#running = true; });
  #stopMock = vi.fn().mockImplementation(async () => { this.#running = false; });

  async start(transportConfig: TransportConfig): Promise<void> {
    await this.#startMock(transportConfig);
  }

  async stop(): Promise<void> {
    await this.#stopMock();
  }

  isRunning(): boolean {
    return this.#running;
  }

  // Expose mocks for verification
  get startMock() { return this.#startMock; }
  get stopMock() { return this.#stopMock; }
}

describe('McpServerManager', () => {
  let manager: McpServerManager;
  let transportConfig: TransportConfig;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty servers map when registry is empty', () => {
      transportConfig = { type: 'stdio' };
      manager = new McpServerManager(transportConfig);
      expect(manager['servers'].size).toBe(0);
      expect(manager['expressServer']).toBeNull();
    });

    it('should initialize ExpressServer when using SSE transport', () => {
      transportConfig = { type: 'sse', port: 3000 };
      manager = new McpServerManager(transportConfig);
      expect(ExpressServer).toHaveBeenCalledWith(3000);
      expect(manager['expressServer']).toBeDefined();
      expect(transportConfig.getTransport).toBeDefined();
    });

    it('should initialize servers from registry', () => {
      // Mock registry with test servers
      const mockRegistry = [
        { id: 'server1', createInstance: () => new MockMcpServer(), options: {} },
        { id: 'server2', createInstance: () => new MockMcpServer(), options: {} },
      ];
      vi.mocked(serverRegistryModule).serverRegistry = mockRegistry;

      transportConfig = { type: 'stdio' };
      manager = new McpServerManager(transportConfig);
      expect(manager['servers'].size).toBe(2);
      expect(manager['servers'].has('server1')).toBe(true);
      expect(manager['servers'].has('server2')).toBe(true);
    });

    it('should handle server initialization errors', () => {
      const mockRegistry = [
        { 
          id: 'server1', 
          createInstance: () => { throw new Error('Init failed'); },
          options: {} 
        },
      ];
      vi.mocked(serverRegistryModule).serverRegistry = mockRegistry;

      transportConfig = { type: 'stdio' };
      manager = new McpServerManager(transportConfig);
      expect(manager['servers'].size).toBe(0);
    });
  });

  describe('Server Lifecycle', () => {
    let server1: MockMcpServer;
    let server2: MockMcpServer;

    beforeEach(() => {
      server1 = new MockMcpServer();
      server2 = new MockMcpServer();
      transportConfig = { type: 'stdio' };
      manager = new McpServerManager(transportConfig);
      manager['servers'].set('server1', server1);
      manager['servers'].set('server2', server2);
    });

    describe('start()', () => {
      it('should start all servers with correct transport config', async () => {
        await manager.start();
        expect(server1.startMock).toHaveBeenCalledWith(transportConfig);
        expect(server2.startMock).toHaveBeenCalledWith(transportConfig);
        expect(server1.isRunning()).toBe(true);
        expect(server2.isRunning()).toBe(true);
        expect(manager['isRunning']).toBe(true);
      });

      it('should start ExpressServer first when using SSE', async () => {
        transportConfig = { type: 'sse', port: 3000 };
        manager = new McpServerManager(transportConfig);
        manager['servers'].set('server1', server1);

        await manager.start();
        const expressServer = vi.mocked(ExpressServer).mock.results[0].value;
        expect(expressServer.start).toHaveBeenCalled();
        expect(server1.startMock).toHaveBeenCalledWith(expect.objectContaining({
          type: 'sse',
          port: 3000,
          getTransport: expect.any(Function),
        }));
      });

      it('should not start servers if already running', async () => {
        await manager.start();
        await manager.start();
        expect(server1.startMock).toHaveBeenCalledTimes(1);
        expect(server2.startMock).toHaveBeenCalledTimes(1);
      });

      it('should handle server start errors', async () => {
        server1.startMock.mockRejectedValueOnce(new Error('Start failed'));
        await manager.start();
        expect(server1.isRunning()).toBe(false);
        expect(server2.isRunning()).toBe(true);
        expect(manager['isRunning']).toBe(true);
      });
    });

    describe('stop()', () => {
      it('should stop all servers', async () => {
        await manager.start();
        await manager.stop();
        expect(server1.stopMock).toHaveBeenCalled();
        expect(server2.stopMock).toHaveBeenCalled();
        expect(server1.isRunning()).toBe(false);
        expect(server2.isRunning()).toBe(false);
        expect(manager['isRunning']).toBe(false);
      });

      it('should stop ExpressServer when using SSE', async () => {
        transportConfig = { type: 'sse', port: 3000 };
        manager = new McpServerManager(transportConfig);
        manager['servers'].set('server1', server1);

        await manager.start();
        await manager.stop();
        const expressServer = vi.mocked(ExpressServer).mock.results[0].value;
        expect(expressServer.stop).toHaveBeenCalled();
      });

      it('should not stop servers if not running', async () => {
        await manager.stop();
        expect(server1.stopMock).not.toHaveBeenCalled();
        expect(server2.stopMock).not.toHaveBeenCalled();
      });

      it('should handle server stop errors', async () => {
        await manager.start();
        server1.stopMock.mockRejectedValueOnce(new Error('Stop failed'));
        await manager.stop();
        expect(server1.isRunning()).toBe(true);
        expect(server2.isRunning()).toBe(false);
        expect(manager['isRunning']).toBe(false);
      });
    });
  });

  describe('Server Management', () => {
    let server: MockMcpServer;

    beforeEach(() => {
      server = new MockMcpServer();
      transportConfig = { type: 'stdio' };
      manager = new McpServerManager(transportConfig);
      manager['servers'].set('test-server', server);
    });

    describe('toggleServer()', () => {
      it('should start stopped server', async () => {
        await manager.toggleServer('test-server');
        expect(server.startMock).toHaveBeenCalledWith(transportConfig);
        expect(server.isRunning()).toBe(true);
      });

      it('should stop running server', async () => {
        await server.start(transportConfig);
        await manager.toggleServer('test-server');
        expect(server.stopMock).toHaveBeenCalled();
        expect(server.isRunning()).toBe(false);
      });

      it('should handle non-existent server', async () => {
        await manager.toggleServer('non-existent');
        expect(server.startMock).not.toHaveBeenCalled();
        expect(server.stopMock).not.toHaveBeenCalled();
      });

      it('should handle toggle errors', async () => {
        server.startMock.mockRejectedValueOnce(new Error('Toggle failed'));
        await expect(manager.toggleServer('test-server')).rejects.toThrow('Toggle failed');
        expect(server.isRunning()).toBe(false);
      });
    });

    describe('getStatus()', () => {
      it('should return correct status for all servers', async () => {
        const server2 = new MockMcpServer();
        manager['servers'].set('server2', server2);

        // Start only one server
        await server.start(transportConfig);

        const status = manager.getStatus();
        expect(status).toEqual({
          'test-server': true,
          'server2': false,
        });
      });
    });
  });
}); 