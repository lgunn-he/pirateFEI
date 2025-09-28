const fs = require('fs');
const { pipeline } = require('stream/promises');
const puppeteer = require('puppeteer');

async function getReqLink(url) {

    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    let link = '';

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().endsWith('.ts'))
            link = request.url();
        request.continue();
    });

    await page.goto(url);
    await browser.close();
    return (link);
}

async function getFrames(url) {

    const batch_size = 25;
    let filenr = 0;

    while (filenr < 1000)
    {
        let url_nr = filenr;
        let promises = [];
        for (let i = 0; i < batch_size; i ++)
        {
            const current_frame = url_nr;
            promises[i] = fetch(url + url_nr + ".ts")
                .then(response => {
                    if (!response.ok)
                        throw new Error('Unsuccessful req');
                    return (response);
                })
                .then(response => {
                    return (response.blob());
                })
                .then(data => {
                    const readable = data.stream();
                    const writable = fs.createWriteStream(`output${current_frame}.ts`);
                    return (pipeline(readable, writable));
            });
            url_nr ++;
        }
        const results = await Promise.allSettled(promises);
        const failIndex = results.findIndex(r => r.status === "rejected");
        if (failIndex == -1)
            filenr += batch_size;
        else
            return (filenr + failIndex);
    }
    return (0);
}

async function getVideoComponents() {

    const url = process.argv[2];
    const dlurl = await getReqLink(url);
    let filenr = 0;

    if (url && dlurl)
        filenr = await getFrames(dlurl.substring(0, dlurl.lastIndexOf('_') + 1));
    console.log(filenr - 1);
}

getVideoComponents();
