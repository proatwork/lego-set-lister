import { CheerioAPI, load } from "cheerio";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { v4 as uuidv4 } from 'uuid';
import { legoColors } from "../data/colors";
import { partTypes } from "../data/partTypes";
export const brickowlKey = "f72b2243b3e97dd90caba309f1216f13ad4199d1463a696e76f56af60c8a7643"

function addUrlParams(params: Record<string, string>) {
   return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&")
}

export async function getSet(set: string) {
   const response = await fetch(
      `https://api.brickowl.com/v1/catalog/id_lookup?type=Set&${addUrlParams({
         key: brickowlKey,
         id: set,
      })}`
   )
   const data = await response.json()
   return data
}

async function writeBOIDS() {
   const allBoids: string[] = [];
   const sets = readFileSync('./data/sets.txt', 'utf8').split('\n').filter(Boolean);
   for (const set of sets) {
      const setData = await getSet(set);
      const { boids } = setData as { boids: string[] };
      if (boids) {
         console.warn(`boids`, boids)
         boids.forEach(boid => {
            if (!allBoids.includes(boid)) {
               allBoids.push(boid);
            }
         });
      }
   }
   console.warn(allBoids)
   writeFileSync('./data/boids.txt', allBoids.join('\n'))
}

async function writeSetUrls() {
   const setUrls: string[] = [];
   const boids = readFileSync('./data/boids.txt', 'utf8').split('\n').filter(Boolean);
   for (const boid of boids) {
      const boidUrl = `https://www.brickowl.com/boid/${boid}`;
      const html = await fetch(boidUrl).then(res => res.text());
      const $ = load(html);
      $.html();
      const setUrl = $('[hreflang="en"]').attr('href');
      setUrls.push(`${setUrl}/inventory`)
   }
   console.warn(setUrls)
   writeFileSync('./data/setUrls.txt', setUrls.join('\n'))
}


async function writeSetHtmls() {
   mkdirSync('./data/sets', { recursive: true })
   const setUrls = readFileSync('./data/setUrls.txt', 'utf8').split('\n').filter(Boolean);
   for (const setUrl of setUrls) {
      const setName = setUrl.replace("https://www.brickowl.com/catalog/", "").replace("/inventory", "")
      if (existsSync(`./data/sets/${setName}.html`)) {
         console.warn(`${setName} already exists`)
         continue;
      }
      const html = await fetch(setUrl).then(res => res.text());
      //get last two parts of the url
      writeFileSync(`./data/sets/${setName}.html`, html)
      await new Promise(resolve => setTimeout(resolve, 10000));
   }
}
function parsePartsList($: CheerioAPI) {
   const list = $('.category-grid li');
   const parts: { img: string, pieceTitle: string, qty: number }[] = [];
   for (const item of list) {
      const $item = $(item);
      const img = $item.find('.category-item-image').find('img').attr('src') ?? '';
      const pieceTitle = $item.find('.category-item-name').find('a').text();
      const qty = $item.find('.cat-item-bot').clone()
         .children()
         .remove()
         .end()
         .text().replace('Qty: ', '').trim();
      parts.push({
         img,
         pieceTitle,
         qty: parseInt(qty)
      })
   }
   return parts;
}

function writePartsFile(parts: { img: string, pieceTitle: string, qty: number }[], setName: string) {
   writeFileSync(`./data/parts/${setName}.json`, JSON.stringify(parts, null, 2));
}


async function writePartsFiles() {
   if (!existsSync('./data/parts')) {
      mkdirSync('./data/parts', { recursive: true })
   }
   //read all html files in data/sets
   const htmls = readdirSync('./data/sets').filter((file: string) => file.endsWith('.html'));
   for (const html of htmls) {
      let setsOwned = 1;
      if (html.includes("lego-mobile-police-dog-training-set-60369")) {
         setsOwned = 3;
      }
      const htmlContent = readFileSync(`./data/sets/${html}`, 'utf8');
      const $ = load(htmlContent);
      const partsList = parsePartsList($);
      let fileName = html.replace('.html', '');
      if (setsOwned > 1) {
         for (let i = 0; i < setsOwned; i++) {
            writePartsFile(partsList, `${fileName}-${i + 1}`)
         }
      } else {
         writePartsFile(partsList, fileName)
      }
   }
   console.warn('done')
}

interface Part {
   img: string;
   pieceTitle: string;
   qty: number;
   uuid: string;
}

async function buildAllPartsInitial() {
   const jsons = readdirSync('./data/parts').filter((file: string) => file.endsWith('.json'));
   const allParts = new Map<string, Part>();
   for (const json of jsons) {
      const jsonContent = readFileSync(`./data/parts/${json}`, 'utf8');
      const parts = JSON.parse(jsonContent) as Part[];
      parts.forEach(part => {
         if (allParts.has(part.pieceTitle)) {
            allParts.set(part.pieceTitle, {
               ...allParts.get(part.pieceTitle)!,
               qty: allParts.get(part.pieceTitle)!.qty + part.qty
            })
         } else {
            allParts.set(part.pieceTitle, part)
         }
      })
   }
   console.warn(allParts)
   writeFileSync('./data/allParts.json', JSON.stringify(Array.from(allParts.values()), null, 2));
}
// writePartsFiles()
//buildAllPartsInitial()


function buildAllPartsFinal() {
   const allParts = readFileSync('./data/allParts.json', 'utf8');
   let parts = JSON.parse(allParts) as Part[];
   parts = parts.map(part => {
      let { pieceTitle } = part;
      const pieceColor = legoColors.find(color => pieceTitle.includes(color))
      if (pieceColor) {
         pieceTitle = pieceTitle.replace(`${pieceColor} `, "")
      }
      pieceTitle = pieceTitle.replace(/\s*\([^)]*\)/g, "")
      pieceTitle = pieceTitle.trim()
      return {
         ...part,
         pieceTitle
      }
   })
   const newPartsMap = new Map<string, Part>();
   parts.forEach(part => {
      if (newPartsMap.has(part.pieceTitle)) {
         newPartsMap.set(part.pieceTitle, {
            ...newPartsMap.get(part.pieceTitle)!,
            qty: newPartsMap.get(part.pieceTitle)!.qty + part.qty
         })
      } else {
         newPartsMap.set(part.pieceTitle, part)
      }
   })
   const newParts = Array.from(newPartsMap.values());

   const partsByType = newParts.reduce((acc, part) => {
      const type = partTypes.find(type => part.pieceTitle.includes(type)) ?? "Other";
      if (!acc[type]) {
         acc[type] = [];
      }
      acc[type].push(part);
      return acc;
   }, {} as Record<string, Part[]>);

   console.warn(partsByType);


   writeFileSync('./data/allPartsFinal.json', JSON.stringify(newParts, null, 2));
   writeFileSync('./data/allPartsFinal-bytype.json', JSON.stringify(partsByType, null, 2));
}
async function assingUuids() {
   const allParts = readFileSync('./data/allPartsFinal-bytype.json', 'utf8');
   const partsByType = JSON.parse(allParts) as Record<string, Part[]>;
   for (const type in partsByType) {
      const parts = partsByType[type];
      for (const part of parts) {
         part.uuid = uuidv4();
      }
   }
   writeFileSync('./data/allPartsFinal-bytype-withuuids.json', JSON.stringify(partsByType, null, 2));
}
async function run() {
   // await writeBOIDS();
   // await writeSetUrls();
   // await writeSetHtmls();
   // await writePartsFiles()
   // await buildAllPartsInitial()
   // await buildAllPartsFinal()
   await assingUuids();
   console.warn("We good")
}
run()