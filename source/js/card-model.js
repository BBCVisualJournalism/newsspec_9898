/**
* @fileOverview Visual Journalism Issue Guide - card-model
* @author BBC / Steven Atherton
* @version RC1
*/

/** @module card-model */
define(['lib/news_special/bootstrap'], function (news) {

    var cache = {};
   
    var CardModel = function (pathDomain, palPath) {
        this.pal = palPath;
        this.pathDomain = pathDomain;
        this.subscribe();
    };

    CardModel.prototype = {

        subscribe: function () {
            var CardModel = this;
            news.pubsub.on('model:card:request', function (data) {
                CardModel.supplyCards(data);
            });
            news.pubsub.on('fetch:policy-cards', function (data) {
                CardModel.hostDomain = CardModel.pal;
                CardModel.extractIssues(data);
            });
        },

        supplyCards: function (data) {
            if (data['staticHost'] !== false) {
                this.hostDomain = this.pathDomain;
            } else {
                this.hostDomain = this.pal;
            }
            if (typeof cache[data['endpoint']] !== 'undefined') {
                news.pubsub.emit('model:card:request:' + data['requestor'], [cache[data['endpoint']]]);
            } else {
                this.fetchHtml(data['endpoint'], data['requestor']);
            }
        },

        // TODO needs to be require
        fetchHtml: function (endpoint, requestor) {
            var CardModel = this;
            news.$.ajax({
                url: CardModel.hostDomain + endpoint,
                type: 'GET',
                dataType: 'text',
                cache: true
            }).success(function (data) {
                CardModel.buildCardCache(data, endpoint, requestor);
            }).fail(function () {
                news.pubsub.emit('model:card:failed:' + requestor);
            });
        },

        buildCardCache: function (data, endpoint, requestor) {
            var tmpContainer = document.createElement('div');

            news.$(tmpContainer).html(data).promise().done(function () {
                var nodes = news.$(tmpContainer);

                cache[endpoint] = {};

                nodes.find('article').each(function () {
                    var name = news.$(this).attr('id').split('card-')[1],
                        fragment = document.createDocumentFragment();
                    
                    fragment.appendChild(this);

                    cache[endpoint][name] = fragment;
                });
            });
            news.pubsub.emit('model:card:request:' + requestor, [cache[endpoint]]);
        },

        extractIssues: function (cards) {
            var issues = [],
                promiseCount = cards.length;

            this.isCachePopulated(cards, promiseCount);

            for (var i = cards.length - 1; i >= 0; i--) {
                var currentIssue = cards[i].split('-')[1];
                this.fetchHtml('/indepthtoolkit/issues-guide/issues/' + currentIssue + '/policies', 'internal');
            }
        },

        isCachePopulated: function (cards, count) {
            var CardModel = this,
                thisCount = count;
            news.pubsub.on('model:card:request:internal', function () {
                thisCount--;
                if (thisCount === 0) {
                    CardModel.buildResultCardsObject(cards);
                }
            });
        },

        buildResultCardsObject: function (cards) {
            var resultCards = {};
            for (var i = cards.length - 1; i >= 0; i--) {
                var thisFragment = cache['/indepthtoolkit/issues-guide/issues/' + cards[i].split('-')[1] + '/policies'][cards[i]];
                resultCards[cards[i]] = thisFragment;
            }
            news.pubsub.emit('fetch:policy-cards:complete', [resultCards]);
        }

    };

    return CardModel;

});