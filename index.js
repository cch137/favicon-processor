const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');


const inputDirname = path.join(__dirname, './input/');
const outputDirname = path.join(__dirname, './output/');

for (const f of [inputDirname, outputDirname]) if (!fs.existsSync(f)) fs.mkdirSync(f);

const inputs = fs.readdirSync(inputDirname);

if (inputs.length === 0) return console.error('ERROR: NO INPUT FILE!\n');

for (const inputFilename of inputs) {
  const itemName = inputFilename.substring(0, inputFilename.lastIndexOf('.'));
  const itemExt = path.extname(inputFilename).substring(1);
  const itemExtUC = itemExt.toUpperCase();
  const inputFilepath = path.join(inputDirname, inputFilename);
  const itemOutputDirname = path.join(outputDirname, itemName);
  const outFp = (fn) => path.join(itemOutputDirname, fn);

  fs.rmSync(itemOutputDirname, { force: true, recursive: true });
  fs.mkdirSync(itemOutputDirname);

  console.log(`Processing file: ${inputFilename}`);

  const sharpItem = sharp(inputFilepath);
  
  fs.copyFile(inputFilepath, outFp(inputFilename), (err) => {
    if (err) throw err;
    console.log(`Copied source file to output folder. (${inputFilename})`);
  });

  [16, 32, 48, 64, 96, 128, 192, 256, 500].forEach(sz => {
    const outputFilename = `${itemName}${sz}x${sz}.${itemExt}`;
      sharpItem.resize(sz, sz).toFormat(itemExt)
      .toFile(outFp(outputFilename), (err, _) => {
        if (err) throw err;
        console.log(`Image converted to ${itemExtUC} (${outputFilename})`);
      })
    }
  );

  const faviconInputs = [16, 32, 48, 64].map(sz => outFp(`${itemName}${sz}x${sz}.${itemExt}`));
  const outputFavicon = () => {
    const existFiles = faviconInputs.filter(fp => fs.existsSync(fp)).length;
    if (existFiles != faviconInputs.length) return setTimeout(outputFavicon, 100);
    pngToIco(faviconInputs).then(buf => {
      fs.writeFileSync(outFp('favicon.ico'), buf);
      console.log(`Image converted to ICO (${itemName}/favicon.ico)`);
    });
  }
  outputFavicon();
}