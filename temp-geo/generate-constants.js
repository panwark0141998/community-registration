const fs = require('fs');
const path = require('path');

const statesData = require('./node_modules/india-location-data/src/data/states.json');
const districtsData = require('./node_modules/india-location-data/src/data/districts.json');
const blocksData = require('./node_modules/india-location-data/src/data/blocks.json');

const INDIAN_STATES = [];
const DISTRICTS_BY_STATE = {};
const SUB_DISTRICTS_BY_DISTRICT = {};

// Build quick lookup for districts
const districtMap = {};
districtsData.forEach(d => {
    districtMap[d.id] = d.name;
    SUB_DISTRICTS_BY_DISTRICT[d.name] = []; // Initialize
});

// Build quick lookup for blocks (tehsils)
blocksData.forEach(b => {
    // b.districtId tells us the district
    const distName = districtMap[b.districtId];
    if (distName) {
        if (!SUB_DISTRICTS_BY_DISTRICT[distName].includes(b.name)) {
            SUB_DISTRICTS_BY_DISTRICT[distName].push(b.name);
        }
    }
});

// Build states and districts
statesData.forEach(s => {
    INDIAN_STATES.push(s.name);
    DISTRICTS_BY_STATE[s.name] = [];
    if (s.districtIds) {
        s.districtIds.forEach(dj => {
            if (districtMap[dj]) {
                DISTRICTS_BY_STATE[s.name].push(districtMap[dj]);
            }
        });
    }
});

INDIAN_STATES.sort();
for (const s in DISTRICTS_BY_STATE) {
    DISTRICTS_BY_STATE[s].sort();
}
for (const d in SUB_DISTRICTS_BY_DISTRICT) {
    SUB_DISTRICTS_BY_DISTRICT[d].sort();
}

const fileContent = `
export const INDIAN_STATES = ${JSON.stringify(INDIAN_STATES, null, 4)};

export const DISTRICTS_BY_STATE: Record<string, string[]> = ${JSON.stringify(DISTRICTS_BY_STATE, null, 4)};

export const SUB_DISTRICTS_BY_DISTRICT: Record<string, string[]> = ${JSON.stringify(SUB_DISTRICTS_BY_DISTRICT, null, 4)};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/addressConstants.ts'), fileContent);
console.log('Successfully generated addressConstants.ts!');
