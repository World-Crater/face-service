const rp = require("request-promise")
const fs = require('fs')
const Xray = require('x-ray')
const { resolve } = require("path")
const x = Xray()

const URL = 'http://etigoya955.blog49.fc2.com'

const getName = html => path => new Promise((resolve, reject) => {
  x(html, `#${path}`, 'h2', 'a')((err, header) => err ? reject(err) : resolve(header))
})

const logSubName = imageName => {
  return new Promise((resolve, reject) => {
    fs.appendFile('logSubName.txt', `${imageName}\n`, err => (err) ? reject(err) : resolve())
  })
}

const getHTMLHanlderFromFile = page => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./subNamePage/${page}.txt`, {encoding: 'utf-8'}, function(err,data){
      if (err) reject(err)
      resolve(data)
    })
  })
}

// Business logic
const getOnePageSubName = async (page) => {
  const html = await getHTMLHanlderFromFile(page)
  const handler = getName(html)
  const allNamePaths = html
    .match(/id="(e\d+)/g)
    .map(item => item.match(/e\d+/)[0])
  return (await Promise.all(allNamePaths.map(item => handler(item))))
    .map(item => item.split('＝'))
    .map(item => item
      .map(nestItem => 
          nestItem.includes('（') ? nestItem.match(/(.*)（/)[1]
        :                           nestItem
      )
      .filter(nestItem => nestItem !== '素人')
    )
}

const getBatchPageSubName = async (start, end) => (await Promise.all([...Array(end + 1).keys()].slice(start)
  .map(item => getOnePageSubName(item.toString()))))
  .flat()

;(async () => {
  try {
    const batchSubName = await getBatchPageSubName(0, 97)
    batchSubName.forEach(item => logSubName(item))
  } catch (err) {
    console.error(err)
  }
})()