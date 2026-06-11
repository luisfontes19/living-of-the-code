const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, 'site');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadAllTechniques() {
    const techniques = [];

    function scanDir(dir) {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (entry.endsWith('.yml') || entry.endsWith('.yaml')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                try {
                    const data = yaml.load(content);
                    data._slug = path.basename(entry, path.extname(entry));
                    techniques.push(data);
                } catch (e) {
                    console.error(`Error parsing ${entry}: ${e.message}`);
                }
            }
        }
    }

    scanDir(DATA_DIR);
    return techniques;
}

function build() {
    console.log('Building LOC site...');
    const startTime = Date.now();

    const techniques = loadAllTechniques();
    console.log(`  Loaded ${techniques.length} techniques`);

    ensureDir(OUTPUT_DIR);
    ensureDir(path.join(OUTPUT_DIR, 'assets'));

    // Write techniques as JSON
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'assets', 'data.json'),
        JSON.stringify(techniques, null, 2)
    );
    console.log('  Generated assets/data.json');

    // Copy index.html
    fs.copyFileSync(
        path.join(__dirname, 'templates', 'index.html'),
        path.join(OUTPUT_DIR, 'index.html')
    );
    console.log('  Copied index.html');

    // Copy assets
    const assetsDir = path.join(__dirname, 'assets');
    const assetFiles = fs.readdirSync(assetsDir);
    for (const file of assetFiles) {
        fs.copyFileSync(
            path.join(assetsDir, file),
            path.join(OUTPUT_DIR, 'assets', file)
        );
    }
    console.log(`  Copied ${assetFiles.length} asset files`);

    const elapsed = Date.now() - startTime;
    console.log(`\nBuild complete in ${elapsed}ms`);
    console.log(`Output: ${OUTPUT_DIR}/`);
}

// Watch mode
if (process.argv.includes('--watch')) {
    build();
    console.log('\nWatching for changes...');
    const watchDirs = [DATA_DIR, path.join(__dirname, 'templates'), path.join(__dirname, 'assets')];
    for (const dir of watchDirs) {
        fs.watch(dir, { recursive: true }, (event, filename) => {
            console.log(`\nChange detected: ${filename}`);
            build();
        });
    }
} else {
    build();
}
