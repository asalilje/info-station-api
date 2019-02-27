const express = require("express");
const axios = require("axios");
const cors = require("cors");
const parser = require("xml2js");
const moment = require("moment");

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const sl_url = `http://api.sl.se/api2/realtimedeparturesV4.json?key=${
  process.env.SL_KEY
}&siteid=9184&timewindow=60`;

app.get("/tube", (req, res) => {
  axios
    .get(sl_url)
    .then(response => {
      if (response.data && response.data.ResponseData)
        res.send({ body: response.data.ResponseData.Metros });
    })
    .catch(error => {
      console.log(error);
    });
});

app.get("/weather", (req, res) => {
  axios
    .get("https://www.yr.no/place/sweden/stockholm/tallkrogen/forecast.xml", {
      responseType: "text"
    })
    .then(response => {
      if (response.data) {
        parser.parseString(response.data, (error, result) => {
          const tabular = result.weatherdata.forecast.length
            ? result.weatherdata.forecast[0].tabular
            : null;
          if (!tabular || !tabular.length) res.sendStatus(404);

          let currentTime;
          const weatherData = tabular[0].time
            .reduce((arr, time, index) => {
              if (index === 0) {
                arr.push(time);
                currentTime = moment(time.$.from);
              } else if (index < 5) {
                const weatherTime = moment(time.$.from);
                if (weatherTime.subtract(3, "hours").isSameOrAfter(currentTime))
                  arr.push(time);
              }
              return arr;
            }, [])
            .slice(0, 4);
          res.send({ body: weatherData });
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
});

app.listen(port);

console.log("Info station API started on port " + port);
