const fs = require('fs')
const os = require('os')
const readLine = require('readline')

const PATH_FUELGAMES = '/AppData/LocalLow/FuelGames/'
const PATH_MASTERLOG = '/logs/latest/master.txt'
const PERSONAL_PLAYERID = '3091633'
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index

let path = os.homedir() + PATH_FUELGAMES
const files = fs.readdirSync(path)
path = path + (files[files.length - 1] + '') + PATH_MASTERLOG

async function getEnemyInfo (personalPlayerID) {
  const rl = readLine.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    if (line.indexOf(PATTERN_TARGETDATA) >= 0) {
      const index = line.indexOf(PATTERN_PLAYERID) + PATTERN_PLAYERID.length
      const playerID = line.substring(index, line.indexOf("'", index))
      if (playerID !== PERSONAL_PLAYERID) {
        const targetGodIndex = line.indexOf(PATTERN_TARGETGOD) + PATTERN_TARGETGOD.length
        const targetGod = line.substring(targetGodIndex, line.indexOf("'", targetGodIndex))
        return { playerID, targetGod }
      }
    }
  }
}

getEnemyInfo(PERSONAL_PLAYERID).then(p => console.log(p))
