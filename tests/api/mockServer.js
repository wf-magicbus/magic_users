const http = require('http');
const url = require('url');

function createMockServer() {
  // token -> user mapping
  const tokens = {
    'token-orgA-admin': { user_id: 'uA1', name: 'Alice', org_id: 'OrgA', role: 'admin' },
    'token-orgA-viewer': { user_id: 'uA2', name: 'Aaron', org_id: 'OrgA', role: 'viewer' },
    'token-orgB-admin': { user_id: 'uB1', name: 'Bob', org_id: 'OrgB', role: 'admin' },
  };

  // in-memory user DB with org_id
  const users = [
    { user_id: 'uA1', name: 'Alice', status: 'active', role: 'admin', org_id: 'OrgA' },
    { user_id: 'uA2', name: 'Aaron', status: 'active', role: 'viewer', org_id: 'OrgA' },
    { user_id: 'uB1', name: 'Bob', status: 'active', role: 'admin', org_id: 'OrgB' },
  ];

  const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');

      const authHeader = req.headers['authorization'] || '';
      const token = (authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) || null;
      const caller = token ? tokens[token] : null;

      // GET /api/users -> return users for caller's org
      if (req.method === 'GET' && pathname === '/api/users') {
        if (!caller) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }
        const orgUsers = users.filter((u) => u.org_id === caller.org_id);
        const response = { users: orgUsers, total: orgUsers.length, page: 1, limit: 20 };
        res.statusCode = 200;
        res.end(JSON.stringify(response));
        return;
      }

      // GET /api/users/:id -> return user if in same org, else 403
      const userIdMatch = pathname && pathname.startsWith('/api/users/') && pathname.split('/')[3 - 1];
      if (req.method === 'GET' && userIdMatch) {
        const id = pathname.split('/').pop();
        const found = users.find((u) => u.user_id === id);
        if (!found) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'not_found' }));
          return;
        }
        if (!caller) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }
        if (found.org_id !== caller.org_id) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'forbidden' }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify(found));
        return;
      }

      // POST /api/users -> create user under caller's org
      if (req.method === 'POST' && pathname === '/api/users') {
        if (!caller) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }
        let parsedBody = {};
        try {
          parsedBody = body ? JSON.parse(body) : {};
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_json' }));
          return;
        }
        if (!parsedBody.name) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'missing_name' }));
          return;
        }
        const newUser = {
          user_id: `u${Math.random().toString(36).slice(2, 8)}`,
          name: parsedBody.name,
          status: parsedBody.status || 'active',
          role: parsedBody.role || null,
          org_id: caller.org_id,
        };
        users.push(newUser);
        res.statusCode = 201;
        res.end(JSON.stringify(newUser));
        return;
      }

      // GET /api/url-filter-rules
      if (req.method === 'GET' && pathname === '/api/url-filter-rules') {
        res.statusCode = 200;
        res.end(JSON.stringify([
          { id: 'r1', value: 'example.com', rule_type: 'blocked_url', role: 'admin' }
        ]));
        return;
      }

      // POST /api/url-filter-rules
      if (req.method === 'POST' && pathname === '/api/url-filter-rules') {
        let parsedBody = {};
        try {
          parsedBody = body ? JSON.parse(body) : {};
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_json' }));
          return;
        }
        if (parsedBody.role === 'super_admin') {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'super_admin has no URL restrictions' }));
          return;
        }
        const created = { id: 'new', value: parsedBody.value, rule_type: parsedBody.rule_type, role: parsedBody.role };
        res.statusCode = 201;
        res.end(JSON.stringify(created));
        return;
      }

      // default 404
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not_found' }));
    });
  });

  return {
    start: () => new Promise((resolve) => server.listen(0, () => {
      const addr = server.address();
      const url = `http://127.0.0.1:${addr.port}`;
      resolve({ url, close: () => new Promise((r) => server.close(r)) });
    })),
  };
}

module.exports = { createMockServer };
