const colors = require('colors');

function displayHeader() {
  process.stdout.write('\x1Bc');
  console.log(colors.bgGreen('==========================================================='));
  console.log(colors.bgGreen('==========================================================='));
  console.log(colors.bgWhite('===================== SEPOLIA-B0T ========================='));
  console.log(colors.bgWhite('============== modify all by JAWA-PRIDE  =================='));
  console.log(colors.bgWhite('=========== https://t.me/AirdropJP_JawaPride =============='));
  console.log(colors.bgGreen('==========================================================='));
  console.log(colors.bgGreen('==========================================================='));
  console.log();
}

module.exports = displayHeader;