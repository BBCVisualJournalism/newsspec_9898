define([
    'lib/news_special/bootstrap',
    'lib/news_special/template_engine'
], function (news, TemplateEngine) {

    var Results = function () {
        this.el = $('.page__results');
        this.barChart = this.el.find('.bar-chart');

        news.pubsub.on('results:show', $.proxy(this.showResults, this));
    };

    Results.prototype = {

        showResults: function (results) {
            this.results = results;

            this.drawChart();
        },

        drawChart: function () {
            var orderedData = this.chartCollateData(),
                barTemplateHtml = this.el.find('#bar-chart-bar-html').html();
                templateEngine = new TemplateEngine(),
                _this = this;

            this.barChart.empty();

            for (var i = 0; i < orderedData.length; i++) {
                var barProperties = {
                        partyCode: orderedData[i][0],
                        partyName:  orderedData[i][0],
                        count:  orderedData[i][1],
                    },
                    barHtml = templateEngine.render(barTemplateHtml, barProperties);

                this.barChart.append(barHtml);
            }


            /* Defer the resizing of bars until after we've add to the DOM (so we get the width) */
            setTimeout(function () {
                _this.sizeBars(_this, orderedData);
            }, 0);

        },

        sizeBars: function (_this, orderedData) {
            var largestTotal = orderedData[0][1],
                maxWidth = 0;

            /* Find the longest bar */
            _this.el.find('.bar-chart--label').each(function () {
                var labelWidth = $(this).width();
                if(labelWidth > maxWidth) {
                    maxWidth = labelWidth;
                }
            });

            _this.el.find('.bar-chart--bar').each(function (index) {
                var sizeDiff = largestTotal / orderedData[index][1];
                $(this).css('width', 'calc((100% - ' + (maxWidth + 15) + 'px) / ' + sizeDiff + ')');
            });


        },

        chartCollateData: function () {
            var collatedData = {},
                sortedArray = [];

            for (var i = 0; i < this.results.length; i++) {
                var result = this.results[i],
                    partyCode = result.split('-')[0];

                collatedData[partyCode] = collatedData[partyCode] + 1 || 1;
            }

            for (var data in collatedData)
                sortedArray.push([data, collatedData[data]])


            sortedArray.sort(function(a, b) {return b[1] - a[1]});

            return sortedArray;
        }

    };

    return Results;
});