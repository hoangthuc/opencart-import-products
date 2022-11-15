const fs  = require('fs')
const { selectMysql, insertMysql } = require ( '../mysql')
const convertToProduct = async (config)=>{
    let productExcel = JSON.parse( fs.readFileSync( config.setting.productDataExcel ) )
    let products = []
    for(row of productExcel){
        let product = {}
        // general
        product.oc_product = Object.assign({},config.oc_product)
        product.oc_product.model = row.model
        product.oc_product.price = parseFloat(row.price).toFixed(2)
        let res = await insertMysql(product.oc_product,"oc_product")
        product.oc_product.product_id = res.insertId
        // description
        product.oc_product_description = Object.assign({},config.oc_product_description)
        product.oc_product_description.product_id = res.insertId
        product.oc_product_description.name = row.name.replaceAll("'",'')
        product.oc_product_description.description = row.description?.replaceAll("'",'')
        product.oc_product_description.meta_title = row.name.replaceAll("'",'')
        await insertMysql(product.oc_product_description,"oc_product_description")
       
        //option
        product.oc_product_option = []
        product.oc_product_option_value = []
        for(option in config.oc_option_description){
            if(row[option]){
                let options = row[option]
                let configOption = config.oc_option_description[option]

                let optionItem = Object.assign({},config.oc_product_option)
                optionItem.product_id = res.insertId
                optionItem.option_id = config.oc_option_description[option].id
                let product_option = await insertMysql(optionItem,"oc_product_option")
                optionItem.product_option_id = product_option.insertId
                product.oc_product_option.push(optionItem)

                //option value
                options = options.replaceAll(', ',',')
                options = options.split(',')
                
                for(optionValue of options){
                    let check  = configOption.list.find(item=>item.name.toLowerCase() == optionValue.toLowerCase())
                    if(check){
                        let optionItemValue = Object.assign({},config.oc_product_option_value)
                        optionItemValue.product_option_id = product_option.insertId
                        optionItemValue.product_id = res.insertId
                        optionItemValue.option_id = optionItem.option_id
                        optionItemValue.option_value_id = check.option_value_id
                        if(option == 'size')optionItemValue.price = checkPriceSize(optionValue)
                        let product_option_value = await insertMysql(optionItemValue,"oc_product_option_value")
                        optionItemValue.product_option_value_id = product_option_value.insertId
                        product.oc_product_option_value.push(optionItemValue)
                    }
                }

                if(option=='color'){
                    let imageThumbnail = options[0].toLowerCase()
                    imageThumbnail = imageThumbnail.replaceAll('/','-')
                    imageThumbnail = imageThumbnail.replaceAll(' ','-')
                    product.oc_product.image = "catalog/products/"+product.oc_product.model+"/"+imageThumbnail+".png"
                }
            }
        }

        //category
        product.oc_product_to_category = []
        let category = await selectMysql("SELECT * FROM `oc_category_description`")
        let categories = "All Products,"+row.category
        categories = categories.replaceAll(', ',',')
        categories = categories.split(',')
        for(categoryValue of categories){
            let check = category.find(item=>item.name.toLowerCase() == categoryValue.toLowerCase())
            if(check){
                let categoryItem = {
                    product_id: res.insertId,
                    category_id: check.category_id
                }
                await insertMysql(categoryItem,"oc_product_to_category") 
                product.oc_product_to_category.push(categoryItem)
            }
        }  

    //   await insertMysql(product.oc_product_description,"oc_product_description")
       // console.log(product)
        products.push(product)
    }
    fs.writeFileSync(config.setting.productData, JSON.stringify(products))
   
    
}
const checkPriceSize = (size)=>{
    size = size.toLowerCase()
    if(size === "2xl")return 1
    if(size === "3xl")return 2
    if(size === "4xl")return 3
    if(size === "5xl")return 4
    if(size === "6xl")return 5
    return 0
}

module.exports = {
    convertToProduct
}