import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ServerManager } from './ServerManager';
import { TransportConfig } from './mcp/shared/types';

// Mock McpServerManager
vi.mock('./mcp/manager/McpServerManager', () => ({
  McpServerManager: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    toggleServer: vi.fn().mockResolvedValue(undefined),
    getStatus: vi.fn().mockReturnValue({ 'test-server': true }),
  })),
}));

describe('ServerManager', () => {
  let manager: ServerManager;
  let transportConfig: TransportConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    transportConfig = { type: 'stdio' };
    manager = new ServerManager(transportConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Instantiation', () => {
    it('should create instance with default transport config', () => {
      const defaultManager = new ServerManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.getStatus().isRunning).toBe(false);
    });

    it('should create instance with custom transport config', () => {
      const customConfig: TransportConfig = { type: 'sse', port: 3000 };
      const customManager = new ServerManager(customConfig);
      expect(customManager).toBeDefined();
      expect(customManager.getStatus().isRunning).toBe(false);
    });
  });

  describe('Lifecycle Methods', () => {
    describe('start()', () => {
      it('should start server and update internal state', async () => {
        await manager.start();
        expect(manager.getStatus().isRunning).toBe(true);
        expect(manager['mcpManager'].start).toHaveBeenCalledTimes(1);
      });

      it('should not start server if already running', async () => {
        await manager.start();
        await manager.start();
        expect(manager['mcpManager'].start).toHaveBeenCalledTimes(1);
        expect(manager.getStatus().isRunning).toBe(true);
      });

      it('should handle start errors and maintain stopped state', async () => {
        const error = new Error('Start failed');
        vi.mocked(manager['mcpManager'].start).mockRejectedValueOnce(error);
        
        await expect(manager.start()).rejects.toThrow('Start failed');
        expect(manager.getStatus().isRunning).toBe(false);
      });
    });

    describe('stop()', () => {
      it('should stop server and update internal state', async () => {
        await manager.start();
        await manager.stop();
        expect(manager.getStatus().isRunning).toBe(false);
        expect(manager['mcpManager'].stop).toHaveBeenCalledTimes(1);
      });

      it('should not stop server if not running', async () => {
        await manager.stop();
        expect(manager['mcpManager'].stop).not.toHaveBeenCalled();
        expect(manager.getStatus().isRunning).toBe(false);
      });

      it('should handle stop errors and maintain running state', async () => {
        await manager.start();
        const error = new Error('Stop failed');
        vi.mocked(manager['mcpManager'].stop).mockRejectedValueOnce(error);
        
        await expect(manager.stop()).rejects.toThrow('Stop failed');
        expect(manager.getStatus().isRunning).toBe(true);
      });
    });
  });

  describe('Toggle Operations', () => {
    describe('toggle()', () => {
      it('should start server when toggled while stopped', async () => {
        await manager.toggle();
        expect(manager.getStatus().isRunning).toBe(true);
        expect(manager['mcpManager'].start).toHaveBeenCalledTimes(1);
      });

      it('should stop server when toggled while running', async () => {
        await manager.start();
        await manager.toggle();
        expect(manager.getStatus().isRunning).toBe(false);
        expect(manager['mcpManager'].stop).toHaveBeenCalledTimes(1);
      });

      it('should handle toggle errors and maintain current state', async () => {
        const error = new Error('Toggle failed');
        vi.mocked(manager['mcpManager'].start).mockRejectedValueOnce(error);
        
        await expect(manager.toggle()).rejects.toThrow('Toggle failed');
        expect(manager.getStatus().isRunning).toBe(false);
      });
    });

    describe('toggleMcpServer()', () => {
      it('should delegate server toggle to McpServerManager', async () => {
        await manager.toggleMcpServer('test-server');
        expect(manager['mcpManager'].toggleServer).toHaveBeenCalledWith('test-server');
      });

      it('should handle toggle errors for specific server', async () => {
        const error = new Error('Server toggle failed');
        vi.mocked(manager['mcpManager'].toggleServer).mockRejectedValueOnce(error);
        
        await expect(manager.toggleMcpServer('test-server')).rejects.toThrow('Server toggle failed');
      });
    });
  });

  describe('Status and Cleanup', () => {
    it('should return correct status reflecting internal state', () => {
      const status = manager.getStatus();
      expect(status).toEqual({
        isRunning: false,
        mcp: { 'test-server': true }
      });
    });

    it('should cleanup and stop server when running', async () => {
      await manager.start();
      await manager.cleanup();
      expect(manager.getStatus().isRunning).toBe(false);
      expect(manager['mcpManager'].stop).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup when server is not running', async () => {
      await manager.cleanup();
      expect(manager.getStatus().isRunning).toBe(false);
      expect(manager['mcpManager'].stop).not.toHaveBeenCalled();
    });
  });
}); 