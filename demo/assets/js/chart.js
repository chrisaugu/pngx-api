(function (global) {

  global.Chart = function Chart(params) {
    var defaults = {
      title: "Chart",
      width: 340,
      height: 600,
      animationSteps: 10,
      mode: "day",
      day: {
        label: "#96a2aa",
        yline: "#f2f4f5",
        vline: "#dfe6eb",
        zline: "#ecf0f3",
        bg: "#fff",
        previewMask: "#eef5f9",
        previewMaskA: 0.7,
        previewFrame: "#49b",
        previewFrameA: 0.2
      },
      night: {
        label: "#546778",
        yline: "#293544",
        vline: "#3b4a5a",
        zline: "#313d4d",
        bg: "#242f3e",
        previewMask: "#1f2936",
        previewMaskA: 0.7,
        previewFrame: "#49b",
        previewFrameA: 0.2
      }
    };

    var settings = extend({}, defaults, params);
    this.settings = settings;
    this.settings.data.columns.forEach(function (column, i) {
      if (column[0] === "x") {
        settings.xColumn = i;
      }
    });
    settings.displayed = Object.keys(settings.data.names);
    settings.total = settings.data.columns[settings.xColumn].length - 1;
    settings.begin = settings.total - (settings.total >> 2);
    settings.end = settings.total;

    var chart = document.createElement("div");
    chart.className = "chart";
    settings.container.appendChild(chart);

    var title = document.createElement("h1");
    title.className = "chart-title";
    title.textContent = settings.title;
    chart.appendChild(title);

    var graph = document.createElement("div");
    graph.className = "chart-graph";
    chart.appendChild(graph);

    var view = document.createElement("canvas");
    view.className = "view";
    view.width = settings.width;
    view.height = Math.round(settings.height / 10 * 8);
    var viewCtx = view.getContext("2d");
    graph.appendChild(view);

    var overView = document.createElement("canvas");
    overView.className = "view-overlay";
    overView.width = view.width;
    overView.height = view.height;
    graph.appendChild(overView);
    var overViewCtx = overView.getContext("2d");

    var preview = document.createElement("canvas");
    preview.width = settings.width;
    preview.height = Math.round(settings.height / 10);
    preview.className = "preview";
    preview.style.top = view.height + "px";
    graph.appendChild(preview);
    var previewCtx = preview.getContext("2d");

    var overPreview = document.createElement("canvas");
    overPreview.className = "preview-overlay";
    overPreview.width = preview.width;
    overPreview.height = preview.height;
    overPreview.style.top = preview.style.top;
    graph.appendChild(overPreview);
    var overPreviewCtx = overPreview.getContext("2d");

    this.id = Date.now();
    this.chart = chart;
    this.view = view;
    this.viewCtx = viewCtx;
    this.overView = overView;
    this.overViewCtx = overViewCtx;
    this.preview = preview;
    this.previewCtx = previewCtx;
    this.overPreview = overPreview;
    this.overPreviewCtx = overPreviewCtx;

    settings.preview = {
      x0: 0,
      y0: preview.height,
      x1: preview.width,
      y1: 0,
      lineWidth: 1,
      labels: 0
    };
    settings.view = {
      x0: 0,
      y0: view.height - 40,
      x1: view.width,
      y1: 10,
      lineWidth: 3,
      labels: 5,
      fontSize: 14
    };

    this.drawChart();
    this.drawLegend();
    this.setViewInteraction();
    this.setPreviewInteraction();
  };

  Chart.prototype.destroy = function () {
    var self = this;
    this.addedListeners.forEach(function (item) {
      item.target.removeEventListener.apply(item.target, item.args);
    });
    this.chart.innerHTML = "";
    this.chart.parentNode.removeChild(this.chart);
    Object.getOwnPropertyNames(this).forEach(function (name) {
      delete self[name];
    });
  };

  Chart.prototype.addListener = function () {
    this.addedListeners = this.addedListeners || [];
    var target = arguments[0];
    var args = [].slice.call(arguments, 1);
    target.addEventListener.apply(target, args);
    this.addedListeners.push({
      target: target,
      args: args
    });
  };

  // Draw chart with animation effect
  Chart.prototype.drawChart = function () {
    var self = this;
    var formerPreviewTransform = this.preview.transform;
    var formerViewTransform = this.view.transform;

    var actualPreviewTransform = this.calcTransform("preview", 1, this.settings.total);
    var actualViewTransform = this.calcTransform("view", this.settings.begin, this.settings.end);

    // Nothing to display, clear views
    if (!actualPreviewTransform) {
      this.clear();
      return;
    }
    // Nothing is displayed, render views
    if (!formerPreviewTransform) {
      renderViews(this);
      return;
    }

    var previewTransformDelta = calcTransformDelta(actualPreviewTransform, formerPreviewTransform);
    var viewTransformDelta = calcTransformDelta(actualViewTransform, formerViewTransform);

    var steps = this.settings.animationSteps;
    var step = 1;
    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
    }
    this.animationRequest = requestAnimationFrame(renderStep);

    function renderStep() {
      for (var key in actualPreviewTransform) {
        actualPreviewTransform[key] = formerPreviewTransform[key] + previewTransformDelta[key] / steps * step;
        actualViewTransform[key] = formerViewTransform[key] + viewTransformDelta[key] / steps * step;
        if (key === "begin" || key === "end") {
          actualPreviewTransform[key] = Math.round(actualPreviewTransform[key]);
          actualViewTransform[key] = Math.round(actualViewTransform[key]);
        }
      }
      renderViews();
      if (++step <= steps) {
        self.animationRequest = requestAnimationFrame(renderStep);
      }
    }

    function renderViews(chart) {
      self.clear();
      self.view.transform = actualViewTransform;
      self.renderView("view", actualViewTransform);
      self.preview.transform = actualPreviewTransform;
      self.renderView("preview", actualPreviewTransform);
      self.drawPreviewControl();
    }

    function calcTransformDelta(actual, former) {
      var delta = {};
      for (var key in actual) {
        delta[key] = actual[key] - former[key];
      }
      return delta;
    }
  };

  Chart.prototype.calcTransform = function (viewName, begin, end) {
    if (this.settings.displayed.length == 0) { return; }
    var view = this[viewName],
        viewSettings = this.settings[viewName],
        i,
        j,
        column,
        column_key,
        value,
        minY = 0,
        maxY = 0,
        transform = {
          begin: begin,
          end: end
        };

    for (i = 0; (column = this.settings.data.columns[i]); i++) {
      column_key = column[0];
      if (column_key === "x") {
        transform.minX = column[begin];
        transform.maxX = column[end];
        continue;
      } else if (this.settings.displayed.indexOf(column_key) < 0) {
        continue;
      }
      for (j = begin; j <= end; j++) {
        value = column[j];
        minY = value < minY ? value : minY;
        maxY = value > maxY ? value : maxY;
      }
    }
    transform.begin = begin;
    transform.end = end;
    transform.minY = minY;
    transform.maxY = maxY;
    transform.xRatio = view.width / (transform.maxX - transform.minX);
    transform.yRatio = (viewSettings.y1 - viewSettings.y0) / (transform.maxY - transform.minY);
    transform.xOffset = -transform.minX * transform.xRatio;
    transform.yOffset = -transform.maxY * transform.yRatio + viewSettings.y1;
    transform.xStep = Math.floor( (end - begin) / view.width ) || 1;
    return transform;
  };

  Chart.prototype.clear = function () {
    var viewCtx = this.viewCtx;
    var overViewCtx = this.overViewCtx;
    var previewCtx = this.previewCtx;
    var overPreviewCtx = this.overPreviewCtx;
    this.viewCtx.clearRect(0, 0, this.viewCtx.canvas.width, this.viewCtx.canvas.height);
    this.overViewCtx.clearRect(0, 0, this.overViewCtx.canvas.width, this.overViewCtx.canvas.height);
    this.previewCtx.clearRect(0, 0, this.previewCtx.canvas.width, this.previewCtx.canvas.height);
    this.overPreviewCtx.clearRect(0, 0, this.overPreviewCtx.canvas.width, this.overPreviewCtx.canvas.height);
    var tooltip = document.getElementById("chart-tooltip-" + this.id);
    if (tooltip) {
      tooltip.style.opacity = 0;
    }
  };

  // Render view / preview
  Chart.prototype.renderView = function (viewName, transform) {
    var view = this[viewName];
    var viewSettings = this.settings[viewName];
    var ctx = view.getContext("2d");
    ctx.clearRect(0, 0, view.width, view.height);
    this.drawLabels(viewName, transform);
    var columns = this.settings.data.columns;
    var xColumn = columns[this.settings.xColumn];
    var displayed = this.settings.displayed;
    var colors = this.settings.data.colors;

    ctx.save();
    ctx.lineWidth = viewSettings.lineWidth;
    var i, j, column_key, column, x0, y0, x, y;
    for (i = 0; (column = columns[i]); i++) {
      column_key = column[0];
      if (column_key === "x" || displayed.indexOf(column_key) < 0) {
        continue;
      }
      ctx.strokeStyle = colors[column_key];
      ctx.save();
      ctx.setTransform(transform.xRatio, 0, 0, transform.yRatio, transform.xOffset, transform.yOffset);
      x0 = xColumn[transform.begin];
      y0 = column[transform.begin];
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (j = transform.begin; j <= transform.end; j += transform.xStep) {
        x = xColumn[j];
        y = column[j];
        ctx.lineTo(x, y);
      }
      ctx.restore();
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    ctx.restore();
  };

  // Draw labels in view
  Chart.prototype.drawLabels = function (viewName, transform) {
    var view = this[viewName];
    var viewSettings = this.settings[viewName];
    if (!viewSettings.labels) { return; }
    var colors = this.settings[this.settings.mode];
    var xColumn = this.settings.data.columns[this.settings.xColumn];

    var ctx = this.view.getContext("2d");
    ctx.save();
    ctx.font = viewSettings.fontSize + "px sans-serif";
    ctx.textBaseline = "bottom";
    ctx.strokeStyle = colors.yline;
    ctx.fillStyle = colors.label;
    ctx.lineWidth = 1;
    var yLabels = Math.round(view.height / (viewSettings.fontSize * 7));
    var yStep = Math.round( (transform.maxY - transform.minY) / yLabels ) || 1;
    var exp = Math.floor(Math.log10(yStep));
    yStep = Math.round( yStep / Math.pow(10, exp) ) * Math.pow(10, exp) || 1;
    var y = Math.ceil(transform.minY / yStep) * yStep;
    var i = 0, j = 0;
    while ( y < transform.maxY) {
      ctx.save();
      ctx.setTransform(transform.xRatio, 0, 0, transform.yRatio, transform.xOffset, transform.yOffset);
      ctx.beginPath();
      var x0 = transform.minX;
      var x1 = transform.maxX;
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.restore();
      if (y === 0) {
        ctx.strokeStyle = colors.zline;
      } else {
        ctx.strokeStyle = colors.yline;
      }
      ctx.stroke();
      var labelPosition = view2canvas(x0, y, view);
      ctx.fillText(y, labelPosition[0], labelPosition[1] - 5);
      y += yStep;
    }

    ctx.textBaseline = "top";
    var xLabels = Math.round(view.width / (viewSettings.fontSize * 5 * 1.2));
    var xStep = Math.round( (transform.end - transform.begin) / xLabels ) || 1;
    var x = transform.begin;
    while ( x < transform.end) {
      var value = xColumn[x];
      var labelX = view2canvas(value, 0, view)[0];
      value = new Date(value).toDateString().split(" ").slice(1, 3).join(" ");
      ctx.fillText(value, labelX, view.height - 30);
      x += xStep;
    }
    ctx.restore();
  };

  Chart.prototype.drawLegend = function () {
    var self = this;
    var legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.width = this.view.width + "px";
    this.chart.appendChild(legend);
    this.settings.displayed.forEach(function (columnId) {
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = self.settings.data.names[columnId];
      checkbox.id = columnId;
      checkbox.checked = true;
      checkbox.className = "checkbox-round";
      var color = self.settings.data.colors[columnId];
      checkbox.style.backgroundColor = color;
      checkbox.style.borderColor = color;
      var label = document.createElement("label");
      var name = document.createTextNode(checkbox.name);
      label.appendChild(checkbox);
      label.appendChild(name);
      label.className = "checkbox-round-label ripple";
      legend.appendChild(label);
      self.addListener(checkbox, "change", function (e) {
        if (e.target.checked) {
          self.settings.displayed.push(columnId);
        } else {
          self.settings.displayed = self.settings.displayed.filter(function (item) {
            return item !== columnId;
          });
        }
        self.drawChart();
      });
    });
  };

  Chart.prototype.drawPreviewControl = function () {
    var self = this;
    var ctx = this.overPreviewCtx;
    var preview = this.preview;
    var colors = this.settings[this.settings.mode];

    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.save();
    ctx.fillStyle = colors.previewMask;
    ctx.globalAlpha = colors.previewMaskA;
    ctx.fillRect(0, 0, preview.width, preview.height);
    ctx.restore();

    var x0, x1;

    if (!this.previewFrame) {
      var xColumn = this.settings.xColumn;
      var begin = this.settings.begin;
      var end = this.settings.end;
      var xBegin = this.settings.data.columns[xColumn][begin];
      var xEnd = this.settings.data.columns[xColumn][end];
      x0 = view2canvas(xBegin, 0, preview)[0];
      x1 = view2canvas(xEnd, 0, preview)[0];
      this.previewFrame = {
        x0: x0,
        x1: x1,
      };
    }
    x0 = this.previewFrame.x0;
    x1 = this.previewFrame.x1;

    ctx.clearRect(x0, 0, x1 - x0, preview.height);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, preview.height);
    ctx.lineTo(x1, preview.height);
    ctx.lineTo(x1, 0);
    ctx.lineTo(x0, 0);
    ctx.closePath();
    ctx.moveTo(x0 + 5, preview.height - 1);
    ctx.lineTo(x1 - 5, preview.height - 1);
    ctx.lineTo(x1 - 5, 1);
    ctx.lineTo(x0 + 5, 1);
    ctx.closePath();
    ctx.fillStyle = colors.previewFrame;
    ctx.globalAlpha = colors.previewFrameA;
    ctx.fill("evenodd");
    ctx.restore();
  };

  Chart.prototype.setPreviewInteraction = function () {
    var self = this;
    var preview = this.preview;
    var overPreview = this.overPreview;
    var previewFrame = this.previewFrame;

    var threshold = 10;
    var column = this.settings.data.columns[this.settings.xColumn];

    this.addListener(overPreview, "mousedown", setMove);
    this.addListener(overPreview, "touchstart", setMove);

    var target;
    var prevPointerX;

    function unsetMove(e) {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("mouseup", unsetMove);
      document.removeEventListener("touchend", unsetMove);
    }

    function setMove(e) {
      e.preventDefault();
      var rect = e.target.getBoundingClientRect();
      var clientX;
      if (e.type === "mousedown") {
        clientX = e.clientX;
      } else {
        clientX = e.changedTouches[0].clientX;
      }
      var x = Math.round(clientX - rect.left);
      prevPointerX = x;
      if ( Math.abs(x - previewFrame.x0) <= threshold ) {
        target = "begin";
      } else if ( Math.abs(x - previewFrame.x1) <= threshold ) {
        target = "end";
      } else if (previewFrame.x0 < x && x < previewFrame.x1) {
        target = "frame";
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("touchmove", move, {passive: false});
      document.addEventListener("mouseup", unsetMove);
      document.addEventListener("touchend", unsetMove);
    }

    function move(e) {
      e.preventDefault();
      var rect = overPreview.getBoundingClientRect();
      var clientX;
      if (e.type === "mousemove") {
        clientX = e.clientX;
      } else {
        clientX = e.changedTouches[0].clientX;
      }
      var x = Math.round(clientX - rect.left);
      var deltaX = x - prevPointerX;
      prevPointerX = x;

      var prevBegin = self.settings.begin;
      var prevEnd = self.settings.end;
      var chartBeginX, chartEndX, chartBeginIndex, chartEndIndex;
      var prevFrameBegin = previewFrame.x0;
      var prevFrameEnd = previewFrame.x1;

      if (target === "begin") {
        if (Math.abs(previewFrame.x1 - previewFrame.x0 - deltaX) < threshold * 4) { return; }
        previewFrame.x0 += deltaX;
        if (previewFrame.x0 < 0) {
          previewFrame.x0 = 0;
        }
        chartBeginX = canvas2view(previewFrame.x0, 0, preview)[0];
        chartBeginIndex = Math.abs(binarySearch(column, chartBeginX, function (a, b) { return a - b; }));
        self.settings.begin = chartBeginIndex;
        if (self.settings.begin < 1) {
          self.settings.begin = 1;
        }
      } else if (target === "end") {
        if ( Math.abs(previewFrame.x1 + deltaX - previewFrame.x0) < threshold * 4 ) { return; }
        previewFrame.x1 += deltaX;
        if (previewFrame.x1 > preview.width) {
          previewFrame.x1 = preview.width;
        }
        chartEndX = canvas2view(previewFrame.x1, 0, preview)[0];
        chartEndIndex = Math.abs(binarySearch(column, chartEndX, function (a, b) { return a - b; }));
        self.settings.end = chartEndIndex;
        if (self.settings.end > self.settings.total) {
          self.settings.end = self.settings.total;
        }
      } else if (target === "frame") {
        var previewFrameWidth = previewFrame.x1 - previewFrame.x0;
        if (previewFrame.x0 + deltaX < 0) {
          previewFrame.x0 = 0;
          previewFrame.x1 = previewFrameWidth;
        } else if (previewFrame.x1 + deltaX > preview.width) {
          previewFrame.x1 = preview.width;
          previewFrame.x0 = preview.width - previewFrameWidth;
        } else {
          previewFrame.x0 += deltaX;
          previewFrame.x1 += deltaX;
        }
        var indexDelta = self.settings.end - self.settings.begin;
        chartBeginX = canvas2view(previewFrame.x0, 0, preview)[0];
        chartBeginIndex = Math.abs(binarySearch(column, chartBeginX, function (a, b) { return a - b; }));
        self.settings.begin = chartBeginIndex;
        if (self.settings.begin < 1) {
          self.settings.begin = 1;
        }
        self.settings.end = self.settings.begin + indexDelta;
        if (self.settings.end > self.settings.total) {
          self.settings.end = self.settings.total;
        }
      }
      if (self.settings.begin !== prevBegin || self.settings.end !== prevEnd) {
        self.drawChart();
      } else if (prevFrameBegin !== previewFrame.x0 || prevFrameEnd !== previewFrame.x1) {
        self.drawPreviewControl();
      }
    }
  };

  Chart.prototype.setViewInteraction = function () {
    var self = this;
    var xColumn = this.settings.xColumn;
    var column = this.settings.data.columns[xColumn];
    var view = this.view;
    var currentIndex;
    this.addListener(this.overView, "mousemove", showInfo);
    this.addListener(this.overView, "touchmove", showInfo);

    var tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.id = "chart-tooltip-" + this.id;
    tooltip.style.opacity = "0";
    this.chart.querySelectorAll(".chart-graph")[0].appendChild(tooltip);

    function showInfo(e) {
      var rect = e.target.getBoundingClientRect();
      var clientX;
      if (e.type === "mousemove") {
        clientX = e.clientX;
      } else {
        clientX = e.changedTouches[0].clientX;
      }
      var x = Math.round(clientX - rect.left);
      x = Math.round(canvas2view(x, 0, view)[0]);
      var pointerIndex = binarySearch(column, x, function (a, b) { return a - b; });
      if (pointerIndex < 0) {
        pointerIndex = Math.abs(pointerIndex) - 1;
      }
      if (pointerIndex < view.transform.begin) {
        pointerIndex = view.transform.begin;
      }
      if (pointerIndex > view.transform.end) {
        pointerIndex = view.transform.end;
      }
      var x1 = column[pointerIndex];
      var x2 = column[pointerIndex - 1];
      if ( Math.abs(x2 - x) < Math.abs(x1 - x) && view.transform.begin <= pointerIndex - 1 ) {
        pointerIndex = pointerIndex - 1;
      }
      if (pointerIndex === currentIndex) { return; }
      currentIndex = pointerIndex;
      renderRuler(currentIndex);
      renderTooltip(currentIndex);
    }

    function renderTooltip(currentIndex) {
      tooltip.innerHTML = "";
      var xValue = column[currentIndex];
      var xCaption = document.createElement("div");
      xCaption.textContent = new Date(xValue).toDateString().split(" ").slice(0, -1).join(" ").replace(" ", ", ");
      tooltip.appendChild(xCaption);
      self.settings.data.columns.forEach(function (column) {
        var columnId = column[0];
        if (self.settings.displayed.indexOf(columnId) >= 0) {
          var item = document.createElement("div");
          item.className = "item";
          item.style.color = self.settings.data.colors[columnId];
          tooltip.appendChild(item);
          var value = document.createElement("div");
          value.className = "value";
          item.appendChild(value);
          var label = document.createElement("div");
          label.className = "label";
          item.appendChild(label);
          var yValue = column[currentIndex];
          value.textContent = yValue;
          var yLabel = self.settings.data.names[columnId];
          label.textContent = yLabel;
        }
      });
      tooltip.style.opacity = "1";
      var width = tooltip.offsetWidth;
      var left = Math.round(view2canvas(xValue, 0, view)[0]);
      left += 15;
      tooltip.style.left = "";
      tooltip.style.right = "";

      if ( left + width <= view.width || width >= left - 30) {
        tooltip.style.left = left + "px";
      } else {
        tooltip.style.right = view.width - left + 30 + "px";
      }
    }

    function renderRuler(currentIndex) {
      var colors = self.settings[self.settings.mode];
      var view = self.view;
      var ctx = self.overViewCtx;
      ctx.clearRect(0, 0, view.width, view.height);
      var transform = view.transform;
      ctx.save();
      ctx.setTransform(transform.xRatio, 0, 0, transform.yRatio, transform.xOffset, transform.yOffset);
      ctx.beginPath();
      var x = self.settings.data.columns[xColumn][currentIndex];
      var y0 = view.transform.minY;
      var y1 = view.transform.maxY;
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.restore();
      ctx.strokeStyle = colors.vline;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      self.settings.data.columns.forEach(function (column) {
        var columnId = column[0];
        if ( self.settings.displayed.indexOf(columnId) >= 0 ) {
          var y = column[currentIndex];
          var canvasPoint = view2canvas(x, y, view);
          ctx.beginPath();
          ctx.arc(canvasPoint[0], canvasPoint[1], 5, 0, 2 * Math.PI, false);
          var color = self.settings.data.colors[columnId];
          ctx.strokeStyle = color;
          ctx.fillStyle = colors.bg;
          ctx.lineWidth = self.settings.view.lineWidth;
          ctx.fill();
          ctx.stroke();
        }
      });
      ctx.restore();
    }
  };

  // Helpers

  function canvas2view (x, y, view) {
    var xRatio = view.transform.xRatio;
    var yRatio = view.transform.yRatio;
    var xOffset = view.transform.xOffset;
    var yOffset = view.transform.yOffset;
    return [
      x / xRatio - xOffset / xRatio,
      y / yRatio - yOffset / yRatio
    ];
  }

  function view2canvas (x, y, view) {
    var xRatio = view.transform.xRatio;
    var yRatio = view.transform.yRatio;
    var xOffset = view.transform.xOffset;
    var yOffset = view.transform.yOffset;
    return [
      x * xRatio + xOffset,
      y * yRatio + yOffset
    ];
  }

  function binarySearch(array, value, compare) {
    var i = 1, j, k = array.length - 1, cmp_res;
    while (i <= k) {
      j = (k + i) >> 1;
      cmp_res = compare(value, array[j]);
      if (cmp_res > 0) {
        i = j + 1;
      } else if (cmp_res < 0) {
        k = j - 1;
      } else {
        return j;
      }
    }
    return -i - 1;
  }

  function extend(dst) {
    var i, key;
    for (i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (key in src) {
        dst[key] = src[key];
      }
    }
    return dst;
  }

})(this);
