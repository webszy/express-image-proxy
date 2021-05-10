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
    const imgUrl = decodeURIComponent(req.query.url)
    console.log('proxy image from',imgUrl)
    res.setTimeout(10 * 1000,() => {
        fs.createReadStream(errorPng).pipe(res.status(200).type('png'))
    })
    download(imgUrl)
        .then((e)=>{
            res.status(200).type('png').send(e)
        })
        .catch(e=>{
            console.log('download failed',e)
            fs.createReadStream(errorPng).pipe(res.status(200).type('png'))
        })
        // .pipe(res.status(200).type('png'))
        // .on('end', (e)=>{
        //     console.log('download end',e)
        // })
        // .on('error', ()=>{
        //     console.log('download failed')
        //     fs.createReadStream(errorPng).pipe(res.status(200).type('png'))
        // })

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
