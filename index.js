const apiKey = 'RGAPI-e6442da0-2466-4a66-9857-c059f87c5914'
const summonerForm = document.getElementById('summonerForm')
const warning = document.getElementById('warning')
const dicChampioins = JSON.parse(G_championsJSON)
summonerForm.children[0].value = 'Grizzo'
warning.style.opacity = '0'

/**
 * champion did
 * lane
 * kda 
 * goldEarned
 * minionsPerMinute
 * goldPerMinute
 * totalDamageDealtToChampions */

const getSummoner = async summonerName => {
  const r = await fetch('https://cors-anywhere.herokuapp.com/https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ summonerName +'?api_key='+ apiKey)
  .catch(e => console.log(e))
  if(r.status !== 200){
    return null
  }
  const t = await r.text()
  let j = ''
  try{
    j = JSON.parse(t)
  }catch{
    j = 'null'
  }finally{
    return j
  }
}

const getSummonerMatchHistory = async accountId => {
  const r = await fetch('https://cors-anywhere.herokuapp.com/https://br1.api.riotgames.com/lol/match/v4/matchlists/by-account/'+ accountId +'?queue=420&api_key='+ apiKey)
  .catch(e => console.log(e))
  if(r.status !== 200){
    return null
  }
  const t = await r.text()
  let j = ''
  try{
    j = JSON.parse(t)
  }catch{
    j = 'null'
  }finally{
    return j
  }
}

const getMatchInfo = async matchId => {
  const r = await fetch('https://cors-anywhere.herokuapp.com/https://br1.api.riotgames.com/lol/match/v4/matches/'+ matchId +'?api_key='+ apiKey)
  .catch(e => console.log(e))
  if(r.status !== 200){
    return null
  }
  const t = await r.text()
  let j = ''
  try{
    j = JSON.parse(t)
  }catch{
    j = 'null'
  }finally{
    return j
  }
}

const getMatchStats = (matchInfo, user) => {
  const participantId = matchInfo.participantIdentities.filter(p => p.player.summonerId == user.id)[0].participantId   
  const playerInfo = matchInfo.participants[participantId - 1]
  // const playerLane = [playerInfo.timeline.role, playerInfo.timeline.lane]
  // const kda = [playerInfo.stats.kills, playerInfo.stats.deaths, playerInfo.stats.assists]
  const champion = dicChampioins[playerInfo.championId]
  const win = playerInfo.stats.win
  const teammates = matchInfo.participants.filter(p => p.teamId == playerInfo.teamId)
  const teamStats = teammates.reduce((acm, curr) => {
    if(!Object.keys(acm).includes('damageToChampions')){
      acm.damageToChampions = 0
      acm.damageSelfMitigated = 0
      acm.damageToObjectives = 0
      acm.goldEarned = 0
      acm.assists = 0
    }
    acm.damageToChampions += curr.stats.totalDamageDealtToChampions
    acm.damageToObjectives += curr.stats.damageDealtToObjectives
    acm.goldEarned += curr.stats.goldEarned
    acm.assists += curr.stats.assists
    acm.damageSelfMitigated += curr.stats.damageSelfMitigated
    return acm
  }, {})
  // console.log('game presence:', Math.round(playerInfo.stats.assists / teamStats.assists * 100) + playerInfo.stats.kills)

  const damageToChampions = Math.round(playerInfo.stats.totalDamageDealtToChampions / teamStats.damageToChampions * 100)
  const damageDealtToObjectives = Math.round(playerInfo.stats.damageDealtToObjectives / teamStats.damageToObjectives * 100)
  const damageSelfMitigated = Math.round(playerInfo.stats.damageSelfMitigated / teamStats.damageSelfMitigated * 100)
  const mapPontuation = Math.round(((Math.round(playerInfo.stats.assists / teamStats.assists * 100) * 4) + (playerInfo.stats.kills * 1) + (damageDealtToObjectives * 4)) / 9)

  inGameStats = {
    damageToChampions,
    damageDealtToObjectives,
    damageSelfMitigated,
    gold: Math.round(playerInfo.stats.goldEarned / teamStats.goldEarned * 100),
    mapPontuation,
    xpDeltas: playerInfo.timeline.xpDiffPerMinDeltas,
    csDeltas: playerInfo.timeline.csDiffPerMinDeltas
  }

  return {champion, win, inGameStats}
}

summonerForm.addEventListener('submit', async e => {
  e.preventDefault()
  warning.style.opacity = '1'

  const summoner = await getSummoner(e.target.children[0].value)
  console.log('summoner')

  const matchHistory = await getSummonerMatchHistory(summoner.accountId)
  console.log('history')

  const champions = {}
  const limit = 4
  for(let i = 0; i < matchHistory.matches.length; i++){
    const matchInfo = await getMatchInfo(matchHistory.matches[i].gameId)
    const matchStats = getMatchStats(matchInfo, summoner)
    console.log(matchStats)
    if(!Object.keys(champions).includes(matchStats.champion)){
      champions[matchStats.champion] = {matches: 1}
      champions[matchStats.champion].wins = 0
      // champions[matchStats.champion].kdas = []
    }else{
      champions[matchStats.champion].matches += 1
    }    
    if(matchStats.win){
      champions[matchStats.champion].wins += 1
    }
    // champions[matchStats.champion].kdas = [...champions[matchStats.champion].kdas, matchStats.kda]
    champions[matchStats.champion].winRate = Math.ceil(champions[matchStats.champion].wins / champions[matchStats.champion].matches * 100)

    console.log(Math.ceil(i / limit * 100) + '%')
    if(i >= limit - 1){
      break
    }
  }
  console.log(champions)


  console.log('matches')  
  warning.style.opacity = '0'
})