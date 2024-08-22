const http = require('http');
const url = require('url');

const PORT = 3001;
const comments = [];
const requestStats = {};

const server = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    console.log(`Начало работы сервера на IP: ${ip}, Порт: ${PORT}`);

    // Обработка нового подключения
    console.log(`Новое подключение: ${ip}`);

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Приветствие от сервера!');
        console.log('Выполнен GET запрос');
    } else if (req.method === 'POST' && parsedUrl.pathname === '/comments') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const comment = JSON.parse(body);
                if (!comment.name || !comment.comment) {
                    throw new Error('Неверные данные');
                }
                comments.push(comment);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(comments));
                console.log('Выполнен Post запрос');
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('400 Bad Request');
            }
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/stats') {
        const userAgent = req.headers['user-agent'];
        requestStats[userAgent] = (requestStats[userAgent] || 0) + 1;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        let html = '<table><tr><th>User-Agent</th><th>Количество запросов</th></tr>';
        for (const [userAgent, count] of Object.entries(requestStats)) {
            html += `<tr><td>${userAgent}</td><td>${count}</td></tr>`;
        }
        html += '</table>';
        res.end(html);
        console.log('Выполнен GET/stats запрос');
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request');
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
