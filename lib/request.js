const puppeteer = require('puppeteer')
const { wait } = require('./helper')
const { writeFileSync } = require('fs')
const EventEmitter = require('events').EventEmitter
const e = new EventEmitter()
const ENTRY = 'https://asciinema.org/a/a8BIDMycXReDKlwKefstnGfWG'

let imgBuffer = []
let index = 0

;(async () => {
  const browser = await puppeteer.launch({
    devtools: true
  })

  e.on('close', async () => {
    for (let i = 0; i < imgBuffer.length; i++) {
      writeFileSync(`../imgs/${i}.png`, imgBuffer[i])
    }
    await browser.close()
  })

  const page = await browser.newPage()

  page.setRequestInterception(true)
  page.on('request', (http) => {
    if (http.url === 'https://ssl.google-analytics.com/ga.js') {
      http.abort()
    } else {
      http.continue()
    }
  })

  await page.goto(ENTRY, { 
    waitUntil: 'networkidle2' 
  })

  await wait(5000)

  await page.evaluate(() => { 
    const header = document.querySelector('.navbar-header'); 
    header.style.display = 'none';
    const navbar = document.querySelector('.navbar-default'); 
    navbar.style.display = 'none';
    const cinema = document.querySelector('.cinema'); 
    cinema.style.padding = '0'; 
    const evenInfoDom = document.querySelector('.even.info'); 
    evenInfoDom.style.display = 'none'; 
    const oddMetaDom = document.querySelector('.odd.meta'); 
    oddMetaDom.style.display = 'none'; 
    const footer = document.querySelector('footer'); 
    footer.style.display="none";
    const playBtn = document.querySelector('.playback-button'); 
    playBtn.click();
  })

  const timer = setInterval(async () => {
    // 平均时长在100ms以下
    // console.time('screenshot')
    imgBuffer.push(await page.screenshot())
    // console.timeEnd('screenshot')
    /* if (imgBuffer.length === 150) {
      clearInterval(timer)
      e.emit('close')
    } */
  }, 200)

  await wait(18000)
  clearInterval(timer)

  for (let i = 0; i < imgBuffer.length; i++) {
    writeFileSync(`../imgs/${i}.png`, imgBuffer[i])
  }
  await browser.close()
})()