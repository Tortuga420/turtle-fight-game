const https = require('https');
const fs = require('fs');
const path = require('path');

const turtleUrls = {
    'red': 'https://opengameart.org/sites/default/files/turtle_red.png',
    'blue': 'https://opengameart.org/sites/default/files/turtle_blue.png',
    'green': 'https://opengameart.org/sites/default/files/turtle_green.png',
    'purple': 'https://opengameart.org/sites/default/files/turtle_purple.png'
};

const assetsDir = path.join(__dirname, 'public', 'assets', 'turtles');

// Create directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Download function
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            const filePath = path.join(assetsDir, filename);
            const fileStream = fs.createWriteStream(filePath);
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Download all images
async function downloadAllImages() {
    try {
        for (const [color, url] of Object.entries(turtleUrls)) {
            await downloadImage(url, `${color}-turtle.png`);
        }
        console.log('All turtle images downloaded successfully!');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

downloadAllImages(); 