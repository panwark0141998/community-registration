const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe";
const dest = path.join(__dirname, "cf-tunnel.exe");

console.log("Downloading cloudflared to cf-tunnel.exe...");
const file = fs.createWriteStream(dest);
https.get(url, function (response) {
    if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, function (res2) {
            res2.pipe(file);
            file.on('finish', startTunnel);
        });
    } else {
        response.pipe(file);
        file.on('finish', startTunnel);
    }
}).on('error', function (err) {
    fs.unlink(dest, () => { });
    console.error("Error downloading:", err.message);
});

function startTunnel() {
    file.close();
    console.log("Download complete. Starting tunnel...");

    const tunnel = spawn(dest, ['tunnel', '--url', 'http://localhost:3000'], { stdio: ['ignore', 'pipe', 'pipe'] });

    tunnel.stdout.on('data', (data) => console.log(data.toString()));
    tunnel.stderr.on('data', (data) => {
        const text = data.toString();
        console.log(text);
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match) {
            console.log("\n\n=== TUNNEL READY ===");
            console.log("URL: " + match[0]);
            console.log("====================\n\n");
        }
    });
}
