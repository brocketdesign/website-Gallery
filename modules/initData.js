const moment = require('moment');

async function initData(db){ 
    const d = new Date();
    var options = {
        year: "numeric",
        month: "2-digit",
        day: "numeric"
    };
    let today = d.toLocaleString("ja-JP",options).replace(/-/g, "/");
    
    return
}
module.exports=initData