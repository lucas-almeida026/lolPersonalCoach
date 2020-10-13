const summonerForm = document.getElementById('summonerForm')
const warning = document.getElementById('warning')

summonerForm.children[0].value = 'Grizzo'
warning.style.opacity = '0'

const getSummoner = async summonerName => {
  const r = await fetch('https://cors-anywhere.herokuapp.com/https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ summonerName +'?api_key=RGAPI-052b870e-767a-45f5-bcd4-8805d72fe163')
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
  const r = await fetch('https://cors-anywhere.herokuapp.com/https://br1.api.riotgames.com/lol/match/v4/matchlists/by-account/'+ accountId +'?queue=420&api_key=RGAPI-052b870e-767a-45f5-bcd4-8805d72fe163')
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

summonerForm.addEventListener('submit', async e => {
  e.preventDefault()
  warning.style.opacity = '1'
  const summoner = await getSummoner(e.target.children[0].value)
  const matchHistory = await getSummonerMatchHistory(summoner.accountId)
  warning.style.opacity = '0'
  matchHistory.matches.map(e => {
    console.log(e.gameId)
  })
})