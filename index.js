const createError = require('http-errors')
const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require("helmet")
const path = require('path')
// global variables
const port = process.env.PORT || 3000
const errorPng = path.join(__dirname,'./error.png')
console.log(errorPng)
process.on('unhandledRejection', error => {
    console.error('unhandledRejection Error: ', error.message)
});
// express middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({ optionsSuccessStatus: 204 }))
app.use(helmet.frameguard({
    action: "deny",
}))
app.use(helmet.hidePoweredBy())
app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.get('/', (req, res)=>{
    res.send('welcome to my world')
})
app.get('/proxy', (req, res)=>{
    const download = require('download')
    const fs = require('fs')
    let imgUrl = decodeURIComponent(req.query.url).trim()
    const headers={
        'User-Agent': randomUseragent.getRandom(),
        'Referer': '',//建议填写这两个
        'Origin': ''
    }
    // 判断是否时是正确网址
    if(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|mp4|bmp)$/.test(imgUrl.split('?')[0]) === false){
        return fs.createReadStream(errorPng).pipe(res.status(200).type('png'))
    }
    // 判断媒体类型
    const isVideo = imgUrl.split('?')[0].toLowerCase().endsWith('mp4')
    const type=isVideo ? 'mp4' : 'png'
    // 超时
    res.setTimeout(20 * 1000,() => {
        console.log('res.setTimeout')
        fs.createReadStream(errorPng).pipe(res.status(200).type('png'))
    })

    console.log('proxy image from',imgUrl)

    download(imgUrl,{headers})
        .then((e)=>{
            res.status(200).type(type).send(e)
        })
        .catch(e=>{
            console.log('download failed',e)
            fs.createReadStream(errorPng).pipe(res.status(200).type(type))
        })
})
// catch 404
app.use((req, res, next) => {
    next(createError(404))
})
// error handler
app.use((err, req, res) => {
    const status = err.status || 500
    res.send(`{ status: ${status} }`)
})
// running app
app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
})
