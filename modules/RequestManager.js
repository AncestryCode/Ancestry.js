let req = require('axios').default;

module.exports = class RequestManager {
    post(url, data) {
        return new Promise(async(s,r)=>{
            req({
                method: "POST",
                url,
                data,
                headers: {
                    "Content-type": "application/json",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"
                }
            }).then((d) => {
                s({data:d.data,status:d.status});
            }).catch(e => {
                r(e);
            });
        });
    }
}