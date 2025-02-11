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
    <div className="app">
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
    </div>
  );
};

export default App; 