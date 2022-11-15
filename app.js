const fs  = require('fs')
const { setup } = require ('./setup')
const { convertToProduct } = require ('./productOpencart')
const { selectMysql, insertMysql } = require ( './mysql')
const run = async ()=>{
    let config = await setup()
    await convertToProduct(config)
}

run()