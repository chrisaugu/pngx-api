(function (global) {
  global.ChartsApp = function ChartsApp() {
    var charts = [];
    var symbols = [];
    var symbol = "";
    var mode = "day";

    var appContainer = document.getElementById("charts-app");

    var buttonsContainer = document.createElement("div");
    buttonsContainer.id = "buttons-container";
    appContainer.appendChild(buttonsContainer);

    var chartsContainer = document.createElement("div");
    chartsContainer.id = "charts-container";
    appContainer.appendChild(chartsContainer);

    // var loadDataButton = document.createElement("input");
    // loadDataButton.type = "button";
    // loadDataButton.value = "Load default data";
    // loadDataButton.addEventListener("click", loadData.bind(undefined, "/assets/chart_data.json"));
    // buttonsContainer.appendChild(loadDataButton);

    // var load1000Button = document.createElement("input");
    // load1000Button.type = "button";
    // load1000Button.value = "Load 1 000";
    // load1000Button.addEventListener("click", loadData.bind(undefined, "/assets/1000.json"));
    // buttonsContainer.appendChild(load1000Button);

    // var load10000Button = document.createElement("input");
    // load10000Button.type = "button";
    // load10000Button.value = "Load 10 000";
    // load10000Button.addEventListener("click", loadData.bind(undefined, "/assets/10000.json"));
    // buttonsContainer.appendChild(load10000Button);

    // var load100000Button = document.createElement("input");
    // load100000Button.type = "button";
    // load100000Button.value = "Load 100 000";
    // load100000Button.addEventListener("click", loadData.bind(undefined, "/assets/100000.json"));
    // buttonsContainer.appendChild(load100000Button);

    // var uploadDataButton = document.createElement("input");
    // uploadDataButton.type = "file";
    // uploadDataButton.addEventListener("change", uploadData);
    // buttonsContainer.appendChild(uploadDataButton);

    // var clearChartsButton = document.createElement("input");
    // clearChartsButton.type = "button";
    // clearChartsButton.value = "Clear";
    // clearChartsButton.addEventListener("click", clearCharts);
    // buttonsContainer.appendChild(clearChartsButton);

    var stockOptions = document.createElement("select");
    getStockOptions().then((stocks) => {
      symbols.forEach((stock) => {
        stockOptions.add(new Option(stock, stock.toLowerCase()));
      });
    });
    stockOptions.addEventListener("select", function (e) {
      console.log("he");
    });
    buttonsContainer.appendChild(stockOptions);

    var modeSwitch = document.createElement("a");
    modeSwitch.id = "mode-switch";
    modeSwitch.className = "mode-switch";
    modeSwitch.href = "#";
    modeSwitch.textContent = "Switch to Night Mode";
    modeSwitch.addEventListener("click", function (e) {
      var body = document.getElementsByTagName("body")[0];
      e.preventDefault();
      var cmd = e.target.textContent;
      if (cmd === "Switch to Night Mode") {
        body.className = "night-mode";
        mode = "night";
        e.target.textContent = "Switch to Day Mode";
      } else {
        body.className = "day-mode";
        mode = "day";
        e.target.textContent = "Switch to Night Mode";
      }
      charts.forEach(function (chart) {
        chart.settings.mode = mode;
        chart.drawChart();
      });
    });
    appContainer.appendChild(modeSwitch);

    loadData("assets/chart_data.json");
    // loadData("/api/v2/historicals/BSP/essentials");
    // loadData("/api/v2/historicals/CPL/essentials");

    function clearCharts() {
      charts.forEach(function (chart) {
        chart.destroy();
      });
      charts = [];
    }

    function loadData(file) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        let json = JSON.parse(this.responseText);
        // let data = restructureData(json.historical);
        drawChart(json);
      };
      xhr.open("get", file, true);
      xhr.send();
    }

    function restructureData(data = []) {
      const count = data.length;
      let dates = [];
      let bids = [];
      let offers = [];

      if (data && data.length > 0) {
        data.forEach(function (stock) {
          dates.push(new Date(stock.date).getTime());
          bids.push(stock.bid);
          offers.push(stock.offer);
        });

        return [
          {
            columns: [
              ["x", ...dates],
              ["y1", ...bids],
              ["y2", ...offers],
            ],
            types: { y0: "line", y1: "line", x: "x" },
            names: { y0: "#0", y1: "#1" },
            colors: { y0: "#3DC23F", y1: "#F34C44" },
          },
        ];
      } else {
        return [{
          columns: [],
          types: {},
          names: {},
          colors: {}
        }];
      }
    }

    function getStockOptions() {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          symbols = JSON.parse(this.responseText).symbols;
          resolve(JSON.parse(this.responseText).symbols);
        };
        xhr.open("get", "/api/", true);
        xhr.send();
      });
    }

    function uploadData(e) {
      try {
        var input = e.target;
        var file = input.files[0];
        var fileReader = new FileReader();
        fileReader.onload = processData;
        fileReader.readAsText(file);
        input.value = "";
      } catch (error) {
        alert("Something is wrong with the data");
        console.log(error);
      }
    }

    function processData(e) {
      var content = e.target.result;
      var data = JSON.parse(content);
      drawChart(data);
    }

    function drawChart(data) {
      clearCharts();
      console.log(data)

      var chartsContainer = document.getElementById("charts-container");
      charts = data.map(function (data, i) {
        var chart = new Chart({
          title: "Followers (###)".replace("###", i + 1),
          data: data,
          container: chartsContainer,
          mode: mode,
          width: window.innerWidth - 64,
          height: window.innerHeight - 100,
        });
        return chart;
      });
    }
  };
})(this);
