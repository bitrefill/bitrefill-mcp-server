import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExpressServer } from './ExpressServer';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { Request, Response, RequestHandler } from 'express';
import express from 'express';

// Mock SSE transport
vi.mock('@modelcontextprotocol/sdk/server/sse.js', () => ({
  SSEServerTransport: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    handlePostMessage: vi.fn(),
  })),
}));

// Store route handlers for testing
let sseHandler: RequestHandler;
let messageHandler: RequestHandler;

// Mock express
vi.mock('express', () => {
  const mockRouter = {
    get: vi.fn((path: string, handler: RequestHandler) => {
      if (path === '/sse/:server') {
        sseHandler = handler;
      }
    }),
    post: vi.fn((path: string, handler: RequestHandler) => {
      if (path === '/messages/:server') {
        messageHandler = handler;
      }
    }),
  };

  const mockServer = {
    close: vi.fn(),
  };

  const mockApp = {
    listen: vi.fn().mockImplementation((port, callback) => {
      callback?.();
      return mockServer;
    }),
    get: vi.fn(),
    post: vi.fn(),
    use: vi.fn(),
  };

  const jsonMiddleware = vi.fn((req, res, next) => next());

  const mockExpress = Object.assign(
    vi.fn(() => mockApp),
    { 
      Router: vi.fn(() => mockRouter),
      json: vi.fn(() => jsonMiddleware)
    }
  );

  return { default: mockExpress };
});

describe('ExpressServer', () => {
  let server: ExpressServer;
  const TEST_PORT = 3000;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new ExpressServer(TEST_PORT);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Initialization', () => {
    it('should initialize with the provided port', () => {
      expect(server['port']).toBe(TEST_PORT);
      expect(server['app']).toBeDefined();
      expect(server['router']).toBeDefined();
      expect(server['transports'].size).toBe(0);
    });

    it('should setup middleware and routes', () => {
      const mockExpress = vi.mocked(express);
      expect(mockExpress.json).toHaveBeenCalled();
      expect(server['router'].get).toHaveBeenCalledWith('/sse/:server', expect.any(Function));
      expect(server['router'].post).toHaveBeenCalledWith('/messages/:server', expect.any(Function));
    });
  });

  describe('Server Lifecycle', () => {
    it('should start the server and listen on the specified port', async () => {
      await server.start();
      expect(server['app'].listen).toHaveBeenCalledWith(TEST_PORT, expect.any(Function));
      expect(server['server']).toBeDefined();
    });

    it('should stop the server and clean up resources', async () => {
      await server.start();
      const mockServer = server['server'];
      server.stop();
      expect(mockServer?.close).toHaveBeenCalled();
      expect(server['server']).toBeNull();
      expect(server['transports'].size).toBe(0);
    });

    it('should handle server start errors', async () => {
      const error = new Error('Failed to start');
      vi.mocked(server['app'].listen).mockImplementationOnce(() => {
        throw error;
      });
      
      await expect(server.start()).rejects.toThrow('Failed to start');
      expect(server['server']).toBeNull();
    });
  });

  describe('SSE Connections', () => {
    it('should create and store SSE transport for a server', () => {
      const serverId = 'test-server';
      
      // Simulate SSE request
      const mockRequest = {
        params: { server: serverId },
        on: vi.fn(),
      } as unknown as Request;
      
      const mockResponse = {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
        on: vi.fn(),
      } as unknown as Response;

      // Call the SSE handler
      sseHandler(mockRequest, mockResponse, vi.fn());

      // Verify response headers
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockResponse.flushHeaders).toHaveBeenCalled();

      // Verify transport creation and storage
      const transport = server.getTransport(serverId);
      expect(transport).toBeDefined();
      expect(SSEServerTransport).toHaveBeenCalledWith(`/messages/${serverId}`, mockResponse);
      expect(server['transports'].get(serverId)).toBe(transport);
    });

    it('should remove transport when client disconnects', () => {
      const serverId = 'test-server';
      let closeHandler: () => void;
      
      const mockRequest = {
        params: { server: serverId },
        on: vi.fn((event, handler) => {
          if (event === 'close') closeHandler = handler;
        }),
      } as unknown as Request;
      
      const mockResponse = {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
      } as unknown as Response;

      sseHandler(mockRequest, mockResponse, vi.fn());
      expect(server['transports'].has(serverId)).toBe(true);

      // Simulate client disconnect
      closeHandler();
      expect(server['transports'].has(serverId)).toBe(false);
    });
  });

  describe('Message Handling', () => {
    it('should handle messages for existing transports', async () => {
      const serverId = 'test-server';
      const mockTransport = new SSEServerTransport('/test', {} as Response);
      server['transports'].set(serverId, mockTransport);

      const mockRequest = {
        params: { server: serverId },
      } as unknown as Request;
      
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false,
      } as unknown as Response;

      await messageHandler(mockRequest, mockResponse, vi.fn());
      expect(mockTransport.handlePostMessage).toHaveBeenCalledWith(mockRequest, mockResponse);
    });

    it('should return 404 for non-existent transports', async () => {
      const serverId = 'non-existent';
      const mockRequest = {
        params: { server: serverId },
      } as unknown as Request;
      
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false,
      } as unknown as Response;

      await messageHandler(mockRequest, mockResponse, vi.fn());
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: `Transport for server ${serverId} not found`
      });
    });

    it('should handle message processing errors', async () => {
      const serverId = 'test-server';
      const mockTransport = new SSEServerTransport('/test', {} as Response);
      vi.mocked(mockTransport.handlePostMessage).mockRejectedValueOnce(new Error('Processing failed'));
      server['transports'].set(serverId, mockTransport);

      const mockRequest = {
        params: { server: serverId },
      } as unknown as Request;
      
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false,
      } as unknown as Response;

      await messageHandler(mockRequest, mockResponse, vi.fn());
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
}); 