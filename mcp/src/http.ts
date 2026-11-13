import express from "express";
import { randomUUID } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import mcpServer, { OKXServer } from "./server.js";

const app = express();
const port = 3000;

interface HealthComponent {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  message?: string;
}

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const DEPENDENCY_CHECK_INTERVAL = 30000; // 30 seconds

// Cache dependency status to avoid overloading external services
let lastDependencyCheck = { time: 0, status: true };

// async function checkDependencies(): Promise<boolean> {
//     const now = Date.now();
//     if (now - lastDependencyCheck.time < DEPENDENCY_CHECK_INTERVAL) {
//         return lastDependencyCheck.status;
//     }

//     // Perform actual checks
//     const checks = await Promise.all([
//         checkDatabase(),
//         checkExternalAPI(),
//         checkMCPServerInit()
//     ]);

//     lastDependencyCheck = { time: now, status: checks.every(c => c) };
//     return lastDependencyCheck.status;
// }

app.use(express.json());

// Health check state management
const healthState = {
  startTime: Date.now(),
  isReady: false,
  lastCheck: { time: 0, results: {} },
};

// Initialize MCP server with tools and resources
async function initializeMCPServer() {
  // mcpServer.server.setRequestHandler('tools/list', async () => ({
  //     tools: [{
  //         name: 'query-database',
  //         description: 'Query the database',
  //         inputSchema: { type: 'object', properties: { query: { type: 'string' } } }
  //     }]
  // }));

  // Start MCP server on Streamable HTTP transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  await mcpServer.connect(transport);
  // const OKXClient = new OKXServer();
  // await OKXClient.run(transport);

  healthState.isReady = true;

  // Handle incoming MCP requests
  app.post("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
}

// // Comprehensive check - validates MCP capabilities
// app.get('/health', (req, res) => {
//     const health = {
//         status: 'healthy',
//         timestamp: new Date().toISOString(),
//         service: 'mcp-server',
//         version: process.env.npm_package_version || '1.0.0',
//         uptime: process.uptime()
//     };
//     res.status(200).json({ status: 'healthy', server: 'mcp-server' });
//     res.status(200).json(health);

//     try {
//         // Test actual MCP functionality
//         const testTool = mcpServer.tools.find(t => t.name === 'test-tool');
//         if (!testTool) throw new Error('Test tool not found');

//         // Verify tool execution capability
//         const result = await testTool.handler({ test: true });
//         if (!result) throw new Error('Tool execution failed');

//         res.status(200).json({
//             status: 'healthy',
//             mcp: {
//                 tools: mcpServer.tools.length,
//                 resources: mcpServer.resources.length,
//                 capabilities: mcpServer.capabilities
//             }
//         });
//     } catch (error) {
//         res.status(503).json({
//             status: 'unhealthy',
//             error: error.message
//         });
//     }
// });
// app.get('/health/ready', async (req, res) => {
//     const isReady = await checkDependencies();
//     // res.status(isReady ? 200 : 503).json({ ready: isReady });
//     try {
//         const mcpReady = mcpServer.isInitialized && mcpServer.tools.length > 0;
//         const dbConnected = await checkDatabaseConnection();
//         const apiAvailable = await checkExternalAPIHealth();

//         const ready = mcpReady && dbConnected && apiAvailable;

//         res.status(ready ? 200 : 503).json({
//             ready,
//             checks: {
//                 mcp: mcpReady,
//                 database: dbConnected,
//                 externalAPI: apiAvailable
//             },
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         res.status(503).json({
//             ready: false,
//             error: 'Health check failed',
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// app.get('/health/detailed', async (req, res) => {
//     const components: HealthComponent[] = [];

//     // Check MCP server components
//     const mcpStart = Date.now();
//     components.push({
//         name: 'mcp-server',
//         status: mcpServer.isInitialized ? 'healthy' : 'unhealthy',
//         responseTime: Date.now() - mcpStart,
//         message: `${mcpServer.tools.length} tools, ${mcpServer.resources.length} resources`
//     });

//     // Check each dependency with timeout
//     const dbStart = Date.now();
//     try {
//         await Promise.race([
//             checkDatabase(),
//             new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error('Timeout')), 3000)
//             )
//         ]);
//         components.push({
//             name: 'database',
//             status: 'healthy',
//             responseTime: Date.now() - dbStart
//         });
//     } catch (error) {
//         components.push({
//             name: 'database',
//             status: 'unhealthy',
//             responseTime: Date.now() - dbStart,
//             message: error.message
//         });
//     }

//     const overallStatus = components.every(c => c.status === 'healthy')
//         ? 'healthy'
//         : components.some(c => c.status === 'unhealthy')
//             ? 'unhealthy'
//             : 'degraded';

//     res.status(overallStatus === 'healthy' ? 200 : 503).json({
//         status: overallStatus,
//         components,
//         timestamp: new Date().toISOString()
//     });
// });

// Solution: Add timeout wrapper
// async function checkDatabaseWithTimeout() {
//     try {
//         const result = await Promise.race([
//             db.query('SELECT 1'),
//             new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error('Database timeout')), 2000)
//             )
//         ]);
//         return result.rows.length > 0;
//     } catch (error) {
//         console.error('Database health check failed:', error);
//         return false;
//     }
// }

// // Implement a stability window to prevent flapping
// class HealthChecker {
//     private history: boolean[] = [];
//     private readonly windowSize = 5;
//     private readonly healthyThreshold = 0.6;

//     async checkHealth(): Promise<{ stable: boolean; healthy: boolean }> {
//         const currentHealth = await this.performHealthCheck();
//         this.history.push(currentHealth);

//         if (this.history.length > this.windowSize) {
//             this.history.shift();
//         }

//         const healthyCount = this.history.filter(h => h).length;
//         const healthyRatio = healthyCount / this.history.length;

//         return {
//             stable: this.history.length >= this.windowSize,
//             healthy: healthyRatio >= this.healthyThreshold
//         };
//     }
// }

// // Kubernetes-compatible health endpoints
// app.get('/health/startup', (req, res) => {
//     const startupDuration = Date.now() - healthState.startTime;
//     const maxStartupTime = 60000; // 60 seconds

//     if (startupDuration > maxStartupTime && !healthState.isReady) {
//         res.status(503).json({
//             status: 'failed',
//             message: 'Startup timeout exceeded'
//         });
//     } else if (healthState.isReady) {
//         res.status(200).json({ status: 'started' });
//     } else {
//         res.status(503).json({
//             status: 'starting',
//             duration: startupDuration
//         });
//     }
// });

// app.get('/health/live', (req, res) => {
//     // Simple liveness check - process is running
//     res.status(200).json({
//         status: 'alive',
//         pid: process.pid,
//         uptime: process.uptime(),
//         memory: process.memoryUsage()
//     });
// });

// app.get('/health/ready', async (req, res) => {
//     if (!healthState.isReady) {
//         return res.status(503).json({ ready: false, reason: 'Server initializing' });
//     }

//     // Check all critical dependencies
//     const checks = {
//         mcp: mcpServer.capabilities !== undefined,
//         database: await checkDatabase(),
//         cache: await checkRedis(),
//         storage: await checkS3()
//     };

//     const ready = Object.values(checks).every(check => check === true);
//     res.status(ready ? 200 : 503).json({ ready, checks });
// });

// // Prometheus-compatible metrics endpoint
// app.get('/metrics', (req, res) => {
//     const metrics = [
//         `# HELP mcp_server_up MCP server status`,
//         `# TYPE mcp_server_up gauge`,
//         `mcp_server_up{service="production-mcp-server"} ${healthState.isReady ? 1 : 0}`,
//         `# HELP mcp_server_uptime_seconds MCP server uptime`,
//         `# TYPE mcp_server_uptime_seconds counter`,
//         `mcp_server_uptime_seconds ${process.uptime()}`,
//         `# HELP mcp_tools_total Total number of MCP tools`,
//         `# TYPE mcp_tools_total gauge`,
//         `mcp_tools_total ${mcpServer.tools?.length || 0}`
//     ];

//     res.set('Content-Type', 'text/plain');
//     res.send(metrics.join('\n'));
// });

async function start() {
  await initializeMCPServer();

  app.listen(port, () => {
    console.log(`MCP server running on http://localhost:${port}/mcp`);
  });
}

start().catch(console.error);
