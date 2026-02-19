const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function convertDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await convertDir(fullPath);
        } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
            try {
                const image = await Jimp.read(fullPath);
                const newPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                await image.writeAsync(newPath);
                console.log(`Converted: ${file} -> ${path.basename(newPath)}`);
                // fs.unlinkSync(fullPath); // Uncomment to delete original
            } catch (err) {
                console.error(`Error converting ${file}:`, err);
            }
        }
    }
}

convertDir(__dirname).then(() => console.log('Done!'));
