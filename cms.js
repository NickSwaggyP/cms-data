
console.log('程序开始运行')
//爬虫利器puppeteer
const puppeteer = require('puppeteer');
//处理用户输入的模块
const readline = require('readline');

const fs = require('fs');

setDate();
function setDate(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('输入你想往前查询的日期(输入格式：7) ', (answer) => {
        // TODO: Log the answer in a database
        console.log(`正在查找: ${answer}天前到现在 的cms数据，别关窗口 `);
        formDate(answer);
        getData();
        rl.close();
    });
}


//基础url
const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);

// 获取当前年份
const year = currentDate.getFullYear();

// 获取当前月份（注意：月份是从0开始计数的，所以需要加1）
let month = currentDate.getMonth() + 1;
month=month.toString().length==1?"0"+month:month;

// 获取当前日期
const date = currentDate.getDate();

let yearAgo=0;
let monthAgo=0;
let dayAgo=0;


function formDate(dateAgo){
    const DaysAgo = new Date();
    DaysAgo.setDate(currentDate.getDate() - dateAgo+1);

    // 获取7天前的年份
    yearAgo = DaysAgo.getFullYear();

    // 获取7天前的月份（注意：月份是从0开始计数的，所以需要加1）
    monthAgo = DaysAgo.getMonth() + 1;
    monthAgo=monthAgo.toString().length==1?"0"+monthAgo:monthAgo;

    // 获取7天前的日期
    dayAgo = DaysAgo.getDate();
}

let cms=[];
let twice=false;
function getData(){
    let scrape = async () => {
      
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
      
        page.setDefaultNavigationTimeout(60000);
      
        await page.goto('http://showx.baidu.com/group/ecommerce/report/94388');
      
        console.log('Please complete the page login within 1 minute.');
      
        await page.waitForNavigation();
                // 在第一次访问页面后获取登录状态的 cookies
        const cookies = await page.cookies();

        // 在后续的页面访问中设置 cookies
        await page.setCookie(...cookies);
      
        await page.setRequestInterception(true);
        let a=0;
        let isFirstRequest = true;
        page.on('request', async interceptedRequest => {
          const url = interceptedRequest.url(); 
          if(url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/condition-data/con_1013e-b427857d-kexne7'){
            //1、发送请求获取输入时间段段cms页面数组
            const requestData = interceptedRequest.postData();
            const modifiedData = JSON.parse(requestData);
            modifiedData.conditions[0].v = `${yearAgo}-${monthAgo}-${dayAgo},${year}-${month}-${date}`;
      
            interceptedRequest.continue({ postData: JSON.stringify(modifiedData) });
          } else if(url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/chart-data/c_1013e-b0ggpx0f-kbnnv7'){
            //3、每次点击按钮会触发这个请求，在请求头中携带每个cms页面的请求信息
            //该接口为请求表格数据
            const requestData = interceptedRequest.postData();
            const modifiedData = JSON.parse(requestData);
            let currentCms=cms[a];
            console.log(a,'7',currentCms?.label);
            modifiedData.conditionsDisplayValue.second_scene = currentCms?.label || "ALL";
            modifiedData.conditions[3].v = Array.isArray(currentCms?.value) ? currentCms?.value : [currentCms?.value];

            interceptedRequest.continue({ postData: JSON.stringify(modifiedData) });
          } else if (url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/chart-data/c_1013e-3qv9axvc-k6nnr8') {
            //4、每次点击按钮会触发这个请求，在请求头中携带每个cms页面的请求信息
            //该接口为请求图表数据
            const requestData = interceptedRequest.postData();
            const modifiedData = JSON.parse(requestData);
            let currentCms=cms[a++];
            modifiedData.conditionsDisplayValue.second_scene = currentCms?.label || "ALL";
            modifiedData.conditions[3].v = Array.isArray(currentCms?.value) ? currentCms?.value : [currentCms?.value];
            console.log(a-1,'8',currentCms?.label);
            // 爬取一次容易因为网络原因失败，所以循环爬取两次
            if(twice==false&&a>=cms.length+1){
              a=0;
              twice=true;
            }
            if(a>=cms.length+1&&cms.length){
                await browser.close();
            }
      
            interceptedRequest.continue({ postData: JSON.stringify(modifiedData) });
          } else{
              interceptedRequest.continue();
          }
        });

        page.on('response', async response => {
          const url = response.url();
          if(isFirstRequest&&url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/condition-data/con_1013e-b427857d-kexne7'){ 
          // 2、将输入时间段内的cms页面数组存储起来，并且点击查询按钮
          const responseData = await response.json();
              const list=responseData.data.filter(item => !item.label.search('cms页面'));
              cms=list;
              cms.push({ label: cms.map(item => item.label).join(','), value: cms.map(item => item.value) })

              if (cms.length > 0) {
                  await page.goto('http://showx.baidu.com/group/ecommerce/report/94388');
                  console.log("开始爬取数据");
                    await page.waitForSelector('#chart-screenshot-container > div > div.report-content-container > div > div > div.react-grid-item.condition-col.react-resizable-hide.react-resizable > div > div > div.condition-container.clearfix > div.no-paddinglr.col-xs-12.m-t-md.m-b > div > div > div > div > button',{timeout:100000});
                    await page.click('#chart-screenshot-container > div > div.report-content-container > div > div > div.react-grid-item.condition-col.react-resizable-hide.react-resizable > div > div > div.condition-container.clearfix > div.no-paddinglr.col-xs-12.m-t-md.m-b > div > div > div > div > button');
                  isFirstRequest = false;
              }
          }else if (url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/chart-data/c_1013e-b0ggpx0f-kbnnv7') {
              //5、响应数据，将其存储在文件夹表格数据下
              //该接口为请求表格数据
              if (!(await page.isClosed()) && page.url() === 'http://showx.baidu.com/group/ecommerce/report/94388') {
                const responseData = await response.json();
                // 将JSON数据转换为字符串
                const jsonString = JSON.stringify(responseData, null, 2);
                // 将JSON字符串写入文件
                let name=cms[a-1]?.label;
                console.log(cms[a-1],'7',a-1);
                name=name.includes(',')?'cms所有数据':name;
                fs.writeFileSync(`./表格数据/${name}.json`, jsonString);          
                }else{
                  a--;
                }
          }
          else if (url === 'https://sugar.baidu-int.com/api/reportShare/8078fba8ed273caaca5715b4aa1b0532/report/r_1013e-2c6vf95c-kgqrwq/chart-data/c_1013e-3qv9axvc-k6nnr8') {
                  //6、响应数据，将其存储在文件夹图表数据下
                  //该接口为请求图表数据
                  if (!(await page.isClosed()) && page.url() === 'http://showx.baidu.com/group/ecommerce/report/94388') {               
                    const responseData = await response.json();
                        // 将JSON数据转换为字符串
                    const jsonString = JSON.stringify(responseData, null, 2);
                    // 将JSON字符串写入文件
                    let name=cms[a-1]?.label;
                    console.log(cms[a-1],'8',a-1);
                    name=name.includes(',')?'cms所有数据':name;
                    fs.writeFileSync(`./图表数据/${name}.json`, jsonString);

                  }else{
                    a--;
                  }
            }
        })

        await page.goto('http://showx.baidu.com/group/ecommerce/report/94388');
   
        
    };
    scrape().then((value) => {
        console.log('获取信息成功');
    });
}

