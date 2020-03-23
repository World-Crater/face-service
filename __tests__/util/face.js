const faceUtil = require('../../util/face')

test('tokenInfosToHashMap()', () => {
  tokenInfos = [
    {
      "id": "6",
      "name": "光頭葛格",
      "romanization": null,
      "detail": "阿捏母湯八...",
      "preview": null,
      "createdat": "2019-10-18T00:03:20.000Z",
      "updatedat": "2019-10-18T00:03:20.000Z",
      "token": "5507faaf83e00db98bd8a01a251b80dc",
      "infoid": "62"
    },
    {
      "id": "6",
      "name": "光頭葛格",
      "romanization": null,
      "detail": "阿捏母湯八...",
      "preview": null,
      "createdat": "2019-10-18T00:03:20.000Z",
      "updatedat": "2019-10-18T00:03:20.000Z",
      "token": "6507faaf83e00db98bd8a01a251b80dc",
      "infoid": "62"
    }
  ]
  const tokenInfosHashMap = faceUtil.tokenInfosToHashMap(tokenInfos)
  expect(tokenInfosHashMap.get('5507faaf83e00db98bd8a01a251b80dc')).toStrictEqual({
    "id": "6",
    "name": "光頭葛格",
    "romanization": null,
    "detail": "阿捏母湯八...",
    "preview": null,
    "createdat": "2019-10-18T00:03:20.000Z",
    "updatedat": "2019-10-18T00:03:20.000Z",
    "token": "5507faaf83e00db98bd8a01a251b80dc",
    "infoid": "62"
  })
  expect(tokenInfosHashMap.get('6507faaf83e00db98bd8a01a251b80dc')).toStrictEqual({
    "id": "6",
    "name": "光頭葛格",
    "romanization": null,
    "detail": "阿捏母湯八...",
    "preview": null,
    "createdat": "2019-10-18T00:03:20.000Z",
    "updatedat": "2019-10-18T00:03:20.000Z",
    "token": "6507faaf83e00db98bd8a01a251b80dc",
    "infoid": "62"
  })
})