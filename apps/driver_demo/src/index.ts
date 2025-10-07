import path from "path";
import fs from "fs";

const drivers: any[] = [];

function loadDrivers() {
    const driversDir = path.join(__dirname, 'drivers');
    fs.readdirSync(driversDir).forEach(file => {
        const driverPath = path.join(driversDir, file);
        const driver = require(driverPath);
        drivers.push(driver);
    });
}

loadDrivers();

console.log(drivers);
drivers.forEach(driver => {
    console.log(new driver.default('1', undefined));
});