define([
    'lib/news_special/bootstrap',
    'lib/news_special/template_engine',
    'lib/news_special/share_tools/controller'
], function (news, TemplateEngine, ShareTools) {

    var Results = function (options) {
        this.results = [];
        this.partyNames = options.partyNames;
        this.el = $('.page__results');
        this.cardsHolderPri = this.el.find('.results-collection-view-container--pri');
        this.cardsHolderSec = this.el.find('.results-collection-view-container--sec');
        this.barChart = this.el.find('.bar-chart');

        news.pubsub.on('results:show', $.proxy(this.showResults, this));
        news.pubsub.on('results:load-from:share', $.proxy(this.loadFromShare, this));
        news.pubsub.on('fetch:policy-cards:complete', $.proxy(this.displaysCards, this));
        this.el.find('.make-own-button,.start-again').on('click', $.proxy(this.reset, this));
        $('.page__no-cards .start-again').on('click', $.proxy(this.reset, this));
    };

    Results.prototype = {

        showResults: function (results, isShared) {
            news.pubsub.emit('window:scrollTo', [0, 0]);
            if (results.length > 0) {
                this.results = results;
                this.el.removeClass('page__results__shared');

                news.pubsub.emit('fetch:policy-cards', [results]);

                this.drawChart();
                this.addShareTools();

                this.toggleShareView(isShared === true);

                if (isShared) {
                    news.pubsub.emit('istats', ['nav-section', 'newsspec-interaction', 'loaded-shared-policy']);
                } else {
                    news.pubsub.emit('istats', ['nav-section', 'newsspec-interaction', 'results-shown']);
                }
            } else {
                $('.breadcrumbs--to-hide').hide();
            }
        },

        loadFromShare: function (cards) {
            $('.breadcrumbs--to-hide').hide();
            this.showResults(cards, true);
        },

        displaysCards: function (cards) {
            this.cardsHolderPri.empty();
            this.cardsHolderSec.empty();
            
            for (var i = 0; i < this.results.length; i++) {
                var card = cards[this.results[i]],
                    cardHolder = (i % 2 === 0) ? this.cardsHolderPri : this.cardsHolderSec;

                cardHolder.append(card.cloneNode(true));
            }
        },
 
        toggleShareView: function (isShared) {
            var dataValue;
            if (isShared) {
                this.el.addClass('page__results__shared');
                dataValue = 'sharedText';
            } else {
                this.el.removeClass('page__results__shared');
                dataValue = 'selfText';
            }

            this.el.find('[data-self-text]').each(function () {
                var html = $(this).data(dataValue);
                $(this).text(html);
            });
        },

        drawChart: function () {
            var orderedData = this.chartCollateData(),
                barTemplateHtml = this.el.find('#bar-chart-bar-html').html(),
                templateEngine = new TemplateEngine(),
                _this = this;

            this.barChart.empty();

            for (var i = 0; i < orderedData.length; i++) {
                var barProperties = {
                        partyCode: orderedData[i][0],
                        partyName:  _this.partyNames[orderedData[i][0]],
                        count: orderedData[i][1]
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
                if (labelWidth > maxWidth) {
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

            for (var data in collatedData) {
                sortedArray.push([data, collatedData[data]]);
            }
            sortedArray.sort(function (a, b) { return b[1] - a[1]; });

            return sortedArray;
        },

        generateShareUrl: function () {
            return document.referrer + '#' + this.results.join('!');
        },

        addShareTools: function () {
            new ShareTools('#manifesto-share-holder', {
                storyPageUrl: this.generateShareUrl(),
                header: 'Share your manifesto',
                message: 'If I were prime minister, here’s what I would do. See my manifesto and then create yours. #MyManifesto #GE2015',
                hashtag: '',
                image: 'http://ichef.bbci.co.uk/news/640/media/images/81957000/png/_81957420_policies-promo.png',
                template: 'dropdown'
            }, 'manifesto-share');
        },

        reset: function () {
            news.pubsub.emit('window:scrollTo', [0, 0]);
            news.pubsub.emit('reset');
            news.pubsub.emit('ns:sharetools:destroyAll');
            $('#manifesto-share-holder').empty();
            $('.breadcrumbs--to-hide').show();
            $('.page__no-cards').hide();
            if (this.results.length > 0) {
                news.pubsub.emit('istats', ['nav-section', 'newsspec-interaction', 'made-own-from-shared']);
            } else {
                news.pubsub.emit('istats', ['nav-section', 'newsspec-interaction', 'started-again']);
            }
            
        }

    };

    return Results;
});