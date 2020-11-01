const R = require('ramda')
const sizeOf = require('image-size')

test('readList function should parsing string list', () => {
  const readList = list => R.pipe(
    R.split('\n'),
    R.slice(0, -1),
    R.reduce((a, b) => !a[b] ? R.assoc(b, true, a) : a, {}),
    item => Object.keys(item),
    R.map(item => item.split(',')),
    R.map(item => ({name: item[0], url: item[item.length - 1]}))
  )(list)

  const list = `橋本ありな,岩谷志季,https://images16.wav.tv/691/0278d5d6a661c2a6.jpg
神山なな,さくらいななみ,サヤカ・ガブリエル・ウメミヤ,桜井菜々美,江川真希,かみやまなな,えがわまき,https://images15.wav.tv/691/05d6db078f61789b.jpg
姫川ゆうな,https://images15.wav.tv/692/03b1b86712e352b6.jpg
`
  expect(readList(list)).toStrictEqual(
    [
      {name: "橋本ありな", url: "https://images16.wav.tv/691/0278d5d6a661c2a6.jpg"},
      {name: "神山なな", url: "https://images15.wav.tv/691/05d6db078f61789b.jpg"},
      {name: "姫川ゆうな", url: "https://images15.wav.tv/692/03b1b86712e352b6.jpg"}
    ]
  )
})

test('Check image size is not so small', () => {
  const isImageSizeSoSmall = path => {
    const size = sizeOf(path)
    if (size.width <= 10 || size.height <= 10) return true
    return false
  }
  expect(isImageSizeSoSmall('./1595063162085.jpg')).toBe(true)
})
