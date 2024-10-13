const http = require('http');

const comments = []; // Глобальный массив для комментариев
const stats = {}; // Глобальный объект для статистики user-agent

// Создание сервера
const server = http.createServer((req, res) => {
    const { method, url, headers } = req;
    
    // Логируем новые подключения
    console.log(`Новое подключение: ${headers['user-agent']}`);

    // Логируем статистику запросов по user-agent
    if (stats[headers['user-agent']]) {
        stats[headers['user-agent']]++;
    } else {
        stats[headers['user-agent']] = 1;
    }

    // Обработка GET-запроса на /
    if (method === 'GET' && url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Привет, мир!');
    }
    // Обработка POST-запроса на /comments
    else if (method === 'POST' && url === '/comments') {
        let body = '';

        // Чтение данных из тела запроса
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { name, comment } = JSON.parse(body);

                // Проверяем наличие обязательных полей
                if (name && comment) {
                    comments.push({ name, comment });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(comments));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Неверный формат данных' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Некорректный JSON' }));
            }
        });
    }
    // Обработка GET-запроса на /stats
    else if (method === 'GET' && url === '/stats') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <body>
                <table>
                    <tr><th>User-Agent</th><th>Количество запросов</th></tr>
                    ${Object.entries(stats).map(([agent, count]) => `
                        <tr><td>${agent}</td><td>${count}</td></tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `);
    }
    // Возвращаем 400 для всех остальных путей
    else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
    }
});

// Логируем информацию о запуске сервера
server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
