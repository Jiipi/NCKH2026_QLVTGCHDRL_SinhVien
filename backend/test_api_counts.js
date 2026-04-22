const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const loginRes = JSON.parse(data);
            if (!loginRes.data || !loginRes.data.token) {
                console.error('Login failed:', loginRes);
                return;
            }
            const token = loginRes.data.token;

            // Get Activities
            http.get('http://localhost:3001/api/v1/activities?semester=1-2025', { headers: { 'Authorization': `Bearer ${token}` } }, res2 => {
                let d2 = '';
                res2.on('data', c => d2 += c);
                res2.on('end', () => {
                    try {
                        const result = JSON.parse(d2);
                        console.log(`[GET /activities] Total: ${result.data?.total}, Length: ${result.data?.items?.length}`);
                        if (result.data?.items) {
                            console.log('[GET /activities] Items: ', result.data.items.map(i => ({ id: i.id, name: i.ten_hd, status: i.trang_thai, lop: i.lop_id, creator: i.nguoi_tao_id })));
                        }
                    } catch (e) { console.error('Error parsing /activities:', d2); }
                });
            });

            // Get History (Approval page)
            http.get('http://localhost:3001/api/v1/teacher/activities/history?semester=1-2025', { headers: { 'Authorization': `Bearer ${token}` } }, res3 => {
                let d3 = '';
                res3.on('data', c => d3 += c);
                res3.on('end', () => {
                    try {
                        const result = JSON.parse(d3);
                        console.log(`[GET /history] Length: ${result.data?.length}`);
                        if (result.data && Array.isArray(result.data)) {
                            console.log('[GET /history] Items: ', result.data.map(i => ({ id: i.id, name: i.ten_hd, status: i.trang_thai, lop: i.lop_id, creator: i.nguoi_tao_id })));
                        }
                    } catch (e) { console.error('Error parsing /history:', d3); }
                });
            });
        } catch (err) {
            console.error('Error parsing login:', err);
        }
    });
});

req.write(JSON.stringify({ maso: 'gv_vy@example.com', password: 'password123' }));
req.end();
