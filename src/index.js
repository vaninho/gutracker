const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const puppeteer = require('puppeteer')

const PATH_FUELGAMES = '/AppData/LocalLow/FuelGames/'
const PATH_MASTERLOG = '/logs/latest/master.txt'
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_ENEMY_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index
const PATTERN_LOCAL_PLAYERID = 'Sending RegisterPlayer msg... apolloID: '
const URL_GUDECKS_PLAYERSTATS = 'https://gudecks.com/meta/player-stats?userId='

let path = os.homedir() + PATH_FUELGAMES
const files = fs.readdirSync(path)
path = path + (files[files.length - 1] + '') + PATH_MASTERLOG

async function getEnemyInfo() {
  const rl = readLine.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
  })
  let localPlayerId = null
  for await (const line of rl) {

    // getting id from local player
    if (localPlayerId === null && line.indexOf(PATTERN_LOCAL_PLAYERID) >= 0) {
      localPlayerId = line.substring(line.indexOf(PATTERN_LOCAL_PLAYERID) + PATTERN_LOCAL_PLAYERID.length)
    }


    // getting enemy info
    if (line.indexOf(PATTERN_TARGETDATA) >= 0) {
      const index = line.indexOf(PATTERN_ENEMY_PLAYERID) + PATTERN_ENEMY_PLAYERID.length
      const playerID = line.substring(index, line.indexOf("'", index))
      if (playerID !== localPlayerId) {
        const targetGodIndex = line.indexOf(PATTERN_TARGETGOD) + PATTERN_TARGETGOD.length
        const targetGod = line.substring(targetGodIndex, line.indexOf("'", targetGodIndex))
        return { playerID, targetGod }
      }
    }
  }
}

async function getDeck(enemyInfo) {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  console.log(URL_GUDECKS_PLAYERSTATS + enemyInfo.playerID)
  await page.goto(URL_GUDECKS_PLAYERSTATS + enemyInfo.playerID, { waitUntil: 'networkidle0' })
  await page.click('.deck-results-square-shadow-' + enemyInfo.targetGod.toLowerCase() + ' a')
  await page.waitForSelector('.deck-list-item')
  let deck = {}
  const cards = await page.$$('.deck-list-item')
  for (let i = 0; i < cards.length; i++) {
    const mana = await cards[i].$eval('.deck-list-item-mana', e => e.innerText)
    const name = await cards[i].$eval("[class='deck-list-item-name']", e => e.innerText)
    let countPromise = await cards[i].$('.deck-list-item-count')
    let count = '1'
    if (countPromise) {
      count = await (await countPromise.getProperty('innerText')).jsonValue()
    }
    deck[i] = { 'name': name, 'mana': mana, 'count': count }
  }
  browser.close()
  return deck

}

async function main() {
  const enemyInfo = await getEnemyInfo()
  // const deck = await getDeck(enemyInfo)
  // generic deck, used to not getting always from remote when testing.
  // TODO: treat the hero power since its comming as a card.
  const deck = {
    '0': { name: 'Assistant Alchemist', mana: '1', count: 'x2' },
    '1': { name: 'Illuminate', mana: '1', count: 'x2' },
    '2': { name: 'Shadow Scryer', mana: '1', count: 'x2' },
    '3': { name: 'Street Conjuror', mana: '1', count: 'x2' },
    '4': { name: 'Starshard Bolt', mana: '2', count: 'x2' },
    '5': { name: 'Time-Bomb', mana: '2', count: '1' },
    '6': { name: 'Tracking Bolt', mana: '2', count: 'x2' },
    '7': { name: 'All-Seeing Spire', mana: '3', count: 'x2' },
    '8': { name: 'Lightning Talisman', mana: '3', count: '1' },
    '9': { name: 'Miraculous Familiar', mana: '3', count: 'x2' },
    '10': { name: 'Oni Spellsword', mana: '3', count: '1' },
    '11': { name: 'Scepter of Artistry', mana: '3', count: '1' },
    '12': { name: 'Vow of Learning', mana: '3', count: 'x2' },
    '13': { name: 'Wall of Lightning', mana: '4', count: 'x2' },
    '14': { name: 'Wyrmbreath', mana: '4', count: 'x2' },
    '15': { name: 'Crystal Rain', mana: '5', count: '1' },
    '16': { name: 'Monolith of Storms', mana: '5', count: '1' },
    '17': { name: 'Munosian Infiltrator', mana: '2', count: '1' },
    '18': { name: 'Porphyrion, Dread Cyclops', mana: '5', count: '1' },
    '19': { name: 'Magebolt', mana: '2', count: '1' }
  }
  console.log(deck)
}

main()

