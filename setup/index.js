const fs = require ('fs')
const readXlsxFile = require('read-excel-file/node')
const config = JSON.parse( fs.readFileSync('./config/config.json') )
const { selectMysql, insertMysql } = require ( '../mysql')
const setup = async ()=>{
    let res = await selectMysql('SELECT * from oc_option_description')
    for(option in config.oc_option_description){
        let item = res.find(item=>item.name.toLowerCase() == option)
        let list = await selectMysql('SELECT * FROM oc_option_value_description WHERE option_id = '+item.option_id)
        config.oc_option_description[option].id = item.option_id
        config.oc_option_description[option].list = list
    }
    let excels = await readXlsxFile(config.setting.dataPathExcel)
    let header = excels[0]
    let productExcel = []
    for(row in excels){
        let product = {}
        for(key in header ){
           product[ header[key] ] = excels[row][key]
        }
        if(row > 0)productExcel.push(product)
    }
    fs.writeFileSync(config.setting.productDataExcel, JSON.stringify(productExcel))
    return config
}

module.exports = {
    setup
}