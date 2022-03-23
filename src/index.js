const fs = require('fs')
const os = require('os')
const readLine = require('readline')

const PATH_FUELGAMES = '/AppData/LocalLow/FuelGames/'
const PATH_MASTERLOG = '/logs/latest/master.txt'
const PERSONAL_PLAYERID = '3091633'


var path = os.homedir() + PATH_FUELGAMES

files = fs.readdirSync(path)
path = path + (files[files.length - 1] + '') + PATH_MASTERLOG


async function getEnemyPlayerID(personalPlayerID) {
    const rl = readLine.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        if (line.indexOf('TargetData:') >= 0) {
            let index = line.indexOf('playerID:') + 10
            playerID = line.substring(index, line.indexOf("'", index))
            if(playerID !== PERSONAL_PLAYERID) {
                return playerID
            }
        }
    }
}

getEnemyPlayerID(PERSONAL_PLAYERID).then(p => console.log(p))

