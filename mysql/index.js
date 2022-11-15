const mysql = require('mysql')
const util = require('util')
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "opencart_impactwsshop_data"
  });
  conn.connect(function(err) {
    if (err) throw err;
    console.log("Mysql Connected!");
  });
const query = util.promisify(conn.query).bind(conn)
const resulfJson = (res)=>{
    let string =JSON.stringify(res);
    let json =  JSON.parse(string);
    return json
}
const selectMysql = async (q)=>{
    let res =  await query(q);
    return resulfJson(res)
  }
const insertMysql = async (data,table)=>{
    try {
        let colume = Object.keys(data).join(',')
        let values = Object.values(data).join("','")
        let sql = "INSERT INTO "+table+" ("+ colume +") VALUES ('"+values+"')";
        let res = await query (sql)
        return resulfJson(res) 
    } catch (error) {
       console.log(error)
    }
    
}  
  module.exports = {
    selectMysql,
    insertMysql
  }