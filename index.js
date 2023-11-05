const express = require('express');
var path = require('path');
var cors = require('cors');
var app = express()
const axios = require('axios');

const bodyParser = require('body-parser');
require('dotenv').config()
app.use(bodyParser.json()); // เพื่ออ่านข้อมูล JSON ในคำขอ
app.use(cors())

const fs = require('fs');
const csv = require('csv-parser');
const populationData = [];
const countryArr = []
const csvArr = []

// write outputfile(first time)-------------------------
  // const myArr = []
  // const csvFileName = 'output.csv';
  // const emptyData = ''; 
  // fs.writeFile(csvFileName, emptyData, (err) => {});
  // -----------------------------------------------------

  // read outputfile(second time)-------------------------
  fs.createReadStream('output.csv')
  .pipe(csv())
  .on('data', (row) => {
    const columns = Object.values(row); // ดึงข้อมูลทั้งหมดจากแต่ละคอลัมน์
    countryArr.push(columns[0])
    if (!columns[3]){
      csvArr.push({country:columns[0], region:columns[1], img:columns[2]})
    }else{
      csvArr.push({country:columns[0], region:columns[1], img:columns[3]})
    }
  })
  .on('end', () => {
  });
  // ------------------------------------------------------

  function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
  }

  fs.createReadStream('./asset/population-and-demography.csv')
  // fs.createReadStream('./asset/copydata.csv')
  .pipe(csv())
  .on('data', async (data) => {
    const selectedData = {
      'Countryname': data['Country name'],
      'Year': data['Year'],
      'Population': data['Population']
    };

    // fetch data country for write csv (first time)-------------
    // if(!myArr.includes(data['Country name'])){
    //     myArr.push(data['Country name'])
    //     const url = "https://restcountries.com/v3.1/name/" + data['Country name']
    //     const myData = await fetch(url)
    //     .then(res => res.json())
    //     .then(json => {
    //       if(json.status == "404"){
    //         return null
    //       }else{
    //         const countryData = data["Country name"]
    //         for(i in json){
    //           if (json[i].name.common == countryData){
    //             const imgData = json[i].flags.png
    //             let continentsData = json[i].continents
    //             if(continentsData[0].includes("America")){
    //                 continentsData = "Americas"
    //               }
    //             const csvData = countryData + "," + continentsData + "," + imgData + "\n"
    //             fs.appendFile(csvFileName, csvData, async (err) => {});
    //             sleep(5);
    //             return countryArr.push(data["Country name"])
    //           }
    //         }
    //         sleep(5);
    //         return 0
    //       }
    //     }).catch(error => {console.log(error)})
    // }
    // ---------------------------------------------------
    populationData.push(selectedData)
  })
  .on('end', () => {
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/api/data', (req, res) => {

  const formattedData = {};
  populationData.forEach(item => {
  const year = item.Year;
  const countryName = item.Countryname;
  const population = item.Population;
  if (!formattedData[year]) {
    formattedData[year] = {};
  }
  if (countryArr.includes(item.Countryname)){
    formattedData[year][countryName] = parseInt(population);
  }
  });

  // csvArr to regionData
  var regionData = {};
  csvArr.forEach(function(item) {
    var country = item.country;
    var region = item.region;
    if (!regionData[country]) {
        regionData[country] = region;
    }
  });

  // csvArr to imgData
  var imgData = {};
  csvArr.forEach(function(item) {
    var country = item.country;
    var img = item.img;
    if (!imgData[country]) {
        imgData[country] = img;
    }
  });
  const results = {formattedData, regionData, imgData}
  res.json(results)
})

// console.log(process.env.PORT);
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));