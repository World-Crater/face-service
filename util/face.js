function tokenInfosToHashMap (tokenInfos) {
  const tokenInfosHashMap = new Map()
  tokenInfos
    .forEach(tokenInfo => {
      tokenInfosHashMap.set(tokenInfo.token, tokenInfo)
    })
  return tokenInfosHashMap
}

module.exports = {
  tokenInfosToHashMap
}