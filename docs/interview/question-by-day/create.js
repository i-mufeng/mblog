const fs = require('fs');

const getDateContent = (year, mouth) => {
    switch (mouth) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 2:
            if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
                return 29;
            }
            return 28;
        default:
            return 30;
    }
}

const years = [2023, 2024];

for (let i = 1; i < 13; i++) {
    fs.writeFileSync(`./${i}.md`, `---
readingTime: false
hidden: true
---
        `);
}

