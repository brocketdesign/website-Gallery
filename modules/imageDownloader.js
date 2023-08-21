const fs = require('fs');
const Axios = require('axios')
async function imageDownloader(option){
    const response = await Axios({
        url:option.url,
        method: 'GET',
        responseType: 'stream'
    });
    let index = 0
    let name = option.dest+index+option.url.split("?")[0].split(' ').join('-').split(':').join('-').split('/').join('-')
    while (fs.existsSync(name)){
        index ++
        name = option.dest+index+option.url.split("?")[0].split(' ').join('-').split(':').join('-').split('/').join('-')
    }
    return await new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(name))
        .on('close', () => resolve(name));
    });
}
module.exports=imageDownloader
