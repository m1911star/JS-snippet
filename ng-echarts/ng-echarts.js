(function() {
  angular.module('ng-echarts', [])

  .directive('echart', ['$timeout', '$window', function($timeout, $window) {

    function draw(chart, echart, option, theme, init) {
      init && (echart = echarts.init(chart, theme));
      echart.setOption(option);
      return echart;
    };

    function calSize(ele, chart) {
      width  = ele.style.width;
      height = ele.style.height || ele.offsetHeight || '300px';

      if ((height + '').indexOf('px') < 0) { height = height + 'px'; }
      // this is not necessary
      //if ((width + '').indexOf('px') < 0) { width = width + 'px'; }

      return { width: width, height: height };
    };

    function link(scope, element, attrs) {
      var echart, theme, option;
      var autoResize = attrs.autoResize;
      var chart = element.find('div')[0];
      var initialized = false;

      $timeout(function() {
        var size = calSize(element[0], chart);
        chart.style.width = size.width;
        chart.style.height = size.height;
        option && (echart = draw(chart, echart, option, theme, true));
        initialized = true;
      });

      scope.$watch(attrs.theme, function(value) {
        theme = value;
        initialized && option && (echart = draw(chart, echart, option, theme, true));
      });

      scope.$watch(attrs.option, function(value) {
        option = value;
        initialized && option && (echart = draw(chart, echart, option, theme, true));
      }, true);

      scope.$watch(attrs.data, function(value) {
        value && echart.addData(value);
      });

      if (autoResize) {
        $window.addEventListener('resize', function() {
          echart.resize();
        });
      }

    };

    return {
      template: '<div></div>',
      restrict: 'E',
      link: link
    };
  }])

  .factory('echart', ['$window', '$log', function($window, $log) {
    function range(n) {
      var i = -1;
      var a = [];

      while (++i < n) {
        a[i] = i;
      }

      return a;
    }
    function generateXdata(n) {
      return range(n);
    }

    function generateYdata(n) {
      return range(n).map(function() {
        return $window.Math.round($window.Math.random() * 100);
      });
    }

    function generateSeriess(n, line) {
      line = line || 1;
      return range(line).map(function(i) {
        return generateSeries(i, 'line', n);
      });
    }

    function generateSeries(title, type, n) {
      return {
        name: title,
        type: type,
        //showAllSymbol: true,
        //symbolSize: function (value) {
        //  return Math.round(value[2] / 10) + 2;
        //},
        data: generateYdata(n)
      };
    }

    function getSampleChart() {
      var n = 20;
      return {
        option: {
          title: {
            text: 'sample',
            textStyle: { color: '#505050' }
          },
          backgroundColor: { color: 'rgba(0,0,0,0)'},
          theme: 'macarons',
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              return params.seriesName + '<br>' + params.name.toLocaleString() + ': ' + params.value[1];
            }
          },
          legend: { data: []},
          xAxis: [{
            type: 'category',
            axisLine: { lineStyle: { color: '#b3bfc3', width: 1 } },
            axisTick: { lineStyle: { color: '#b3bfc3', width: 1 } },
            axisLabel: { textStyle: { color: '#5c5c5c' } },
            data: generateXdata(n)
          }],
          yAxis: [{
            type: 'value',
            axisLine: { lineStyle: { color: '#b3bfc3', width: 1 } },
            axisTick: { lineStyle: { color: '#b3bfc3', width: 1 } },
            axisLabel: { textStyle: { color: '#5c5c5c' } }
          }],
          series: generateSeriess(n, 1)
        },
        theme: 'macarons',
        data: null,
        autoResize: true
      };
    }

    return {
      getSampleChart: getSampleChart
    };
  }]);
})();
