import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
const run = async () => {
    const allPartsByType = JSON.parse(fs.readFileSync('./src/data/allPartsFinal-bytype.json', 'utf8'))
    for (const partType in allPartsByType) {
        for (const piece of allPartsByType[partType]) {
            piece.id = uuidv4()
        }
    }
    fs.writeFileSync('./src/data/allPartsFinal-uuid.json', JSON.stringify(allPartsByType, null, 2))
}

run()
