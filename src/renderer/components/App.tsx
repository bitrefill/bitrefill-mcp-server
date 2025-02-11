import React, { useEffect, useState } from 'react';
import { ServerStatus } from '../../preload/types';
import './App.css';

const App: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus>({
    isRunning: false,
    mcp: {
      notes: false,
      timer: false
    }
  });

  useEffect(() => {
    // Get initial status
    window.api.getServerStatus().then(setStatus);

    // Subscribe to status updates
    const unsubscribe = window.api.onServerStatusChange(setStatus);

    return () => unsubscribe();
  }, []);

  const handleToggleServer = async () => {
    await window.api.toggleServer();
  };

  const handleToggleMcpServer = async (server: 'notes' | 'timer') => {
    await window.api.toggleMcpServer(server);
  };

  return (
    <div className="container">
      <h1>Server Control Panel</h1>
      
      <div className="server-controls">
        <div className="main-server">
          <h2>Main Server</h2>
          <button 
            onClick={handleToggleServer}
            className={status.isRunning ? 'active' : ''}
          >
            {status.isRunning ? 'Stop Server' : 'Start Server'}
          </button>
        </div>

        <div className="mcp-servers">
          <h2>MCP Servers</h2>
          {Object.entries(status.mcp).map(([server, isRunning]) => (
            <div key={server} className="server-item">
              <span>{server}</span>
              <button 
                onClick={() => handleToggleMcpServer(server as 'notes' | 'timer')}
                className={isRunning ? 'active' : ''}
                disabled={!status.isRunning}
              >
                {isRunning ? 'Stop' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }

        .server-controls {
          display: grid;
          gap: 30px;
        }

        .main-server, .mcp-servers {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          margin-top: 0;
          color: #444;
        }

        button {
          background: #e0e0e0;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          background: #d0d0d0;
        }

        button.active {
          background: #4CAF50;
          color: white;
        }

        button.active:hover {
          background: #45a049;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .server-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }

        .server-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default App; 