/**
* @fileOverview Visual Journalism Issue Guide - Collection view
* @author BBC / Steven Atherton
* @version RC1
*/

/** @module collection-view */
define(['lib/news_special/bootstrap', 'lib/news_special/template_engine'], function (news, TemplateEngine) {

    var CollectionView = function (config) {
        var opts = config || {};

        if (opts.elem) {this.elem = opts.elem; } else {throw new Error('ConstructorError: no elem'); }
        if (opts.staticHost) {this.staticHost = opts.staticHost; } else { this.staticHost = false; }
        if (opts.endpoint) {this.endpoint = opts.endpoint; } else { throw new Error('ConstructorError: no endpoint'); }
        if (opts.openStates) {this.openStates = opts.openStates.split('-'); } else {this.openStates = []; }
        if (opts.filterBy) {this.filterBy = opts.filterBy; } else {throw new Error('ConstructorError: no filterBy'); }
        if (opts.slotSelect) {this.slotSelect = opts.slotSelect; } else { throw new Error('ConstructorError: no slotSelect'); }
        if (opts.regionalOrNationalPartyInWestminster) {this.regionalOrNationalPartyInWestminster  = opts.regionalOrNationalPartyInWestminster; } else { throw new Error('ConstructorError: no regionalOrNationalPartyInWestminster'); }
        if (opts.regionalPartiesWhoNeedToShowInWestinsterView) {this.regionalPartiesWhoNeedToShowInWestinsterView  = opts.regionalPartiesWhoNeedToShowInWestinsterView; } else { this.regionalPartiesWhoNeedToShowInWestinsterView = []; }
        if (opts.partyDefaultNation) {this.partyDefaultNation  = opts.partyDefaultNation; } else { this.partyDefaultNation = {}; }
        if (opts.nations) {this.nations = opts.nations; } else {throw new Error('ConstructorError: no nations'); }
        
        if (this.windowWidth() > 700) {this.viewState = 'two-column'; } else {this.viewState = 'one-column'; }
        this.vocabs = opts.vocabs;
        this.collectionPane = news.$('#js-' + this.elem + '-collection-view-container');
        this.collectionTemplate = news.$('#js-' + this.elem + '-' + this.viewState + '-collection-view-tmpl');
        this.render(this.collectionPane, this.collectionTemplate.html());
        this.viewport = news.$('.issue-guide__cards--collection--' + this.elem);
        this.subscribe();
    };

    CollectionView.prototype = {
        //TODO make a little neater
        determineViewSize: function () {
            var CollectionView = this;
            var width = this.windowWidth();
            if (width < 701 && CollectionView.viewState !== 'one-column') {
                CollectionView.viewState = 'one-column';
                CollectionView.collectionTemplate = news.$('#js-' + CollectionView.elem + '-' + CollectionView.viewState + '-collection-view-tmpl');
                this.render(this.collectionPane, this.collectionTemplate.html());
                CollectionView.addRefreshMask();
                news.pubsub.emit('collection:view:resize', [this.state]);
            }
            if (width > 700 && CollectionView.viewState !== 'two-column') {
                CollectionView.viewState = 'two-column';
                CollectionView.collectionTemplate = news.$('#js-' + CollectionView.elem + '-' + CollectionView.viewState + '-collection-view-tmpl');
                this.render(this.collectionPane, this.collectionTemplate.html());
                CollectionView.addRefreshMask();
                news.pubsub.emit('collection:view:resize', [this.state]);
            }
        },
        render: function (target, template) {
            var engine = new TemplateEngine();
            target.html(engine.render(template));
            this.publish();
        },
        subscribe: function () {
            var CollectionView = this;
            news.pubsub.on('collection:view:update:' + CollectionView.elem, function (data) {
                CollectionView.addRefreshMask();
                CollectionView.makeApiCall(data);
            });
            news.pubsub.on('model:card:request:collection:view:' + CollectionView.elem, function (data) {
                news.$('.issue-guide__no-content__' + CollectionView.elem).removeClass('issue-guide__no-content__' + CollectionView.elem + '--active');
                if (CollectionView.dataState['selection'] !== 'all') {
                    CollectionView.showCards(data);
                } else {
                    CollectionView.addRefreshMask();
                    CollectionView.showOverviewCards(data);
                }
                news.pubsub.emit('collection:view:switch:state:' + CollectionView.elem, [CollectionView.state]);
            });
            news.pubsub.on('model:card:failed:collection:view:' + CollectionView.elem, function () {
                CollectionView.showFallBack();
            });
            news.pubsub.on('collection:view:apply:filter', function (data) {
                CollectionView.applyFilters(data);
            });
            news.$(window).resize(function () {
                CollectionView.determineViewSize();
            });
        },

        publish: function () {
            var CollectionView = this;
            this.collectionPane.find('.js-slot').on('click', function (event) {
                event.preventDefault();
                CollectionView.cardEventProxy(event);
            });
        },

        cardEventProxy: function (event) {
            var CollectionView = this,
                identifier,
                moveTo;
            identifier = news.$(event.currentTarget).find('article').attr('id').split('card-')[1];

            if (news.$(event.target).hasClass('guide-card__cta')) {
                news.pubsub.emit('popup:confirm:issue', [identifier]);
            }

            CollectionView.openCloseCards(news.$(event.currentTarget).find('article'), event.target);


        },

        openCloseCards: function (card, element) {
            if (news.$(element).hasClass('guide-card__' + this.filterBy[this.elem])) {
                card.toggleClass('guide-card--expanded');
                if (card.hasClass('guide-card--expanded')) {
                    news.pubsub.emit('istats', [this.filterBy[this.elem] + '-expand', 'expand-' + this.filterBy[this.elem], card.attr('id')]);
                } else {
                    news.pubsub.emit('istats', [this.filterBy[this.elem] + 'collapse', 'collapse-' + this.filterBy[this.elem], card.attr('id')]);
                }
                
            }
        },

        showFallBack: function () {
            news.$('.js-slot').empty();
            news.$('.issue-guide__no-content__' + this.elem).addClass('issue-guide__no-content__' + this.elem + '--active');
            this.removeRefreshMask();
        },

        showCards: function (cards) {
            this.trumpCardPlaced = {};
            news.$('.issue-guide__cards--collection--' + this.elem + ' .js-slot').empty();
            this.displayIssueCards(cards);
            this.changeCta();
            this.removeRefreshMask();
        },

        displayIssueCards: function (cards) {
            for (var card in cards) {
                var tmpElement = news.$(document.createElement('DIV')),
                    slotByView,
                    slotByDropDown;
                tmpElement.append(cards[card].cloneNode(true));
                slotByView = tmpElement.find('article').data(this.elem);
                slotByDropDown = tmpElement.find('article').data(this.filterBy[this.elem]);
                slotByNation = tmpElement.find('article').data('nation');
                if (slotByNation === this.partyDefaultNation[slotByDropDown]) {
                    if (news.$.inArray(slotByDropDown, this.regionalPartiesWhoNeedToShowInWestinsterView) > -1) {
                        this.loopThroughAndAddCardsToMultipleViews(slotByDropDown, slotByNation, cards[card], false, true);
                    } else {
                        this.loopThroughAndAddCardsToMultipleViews(slotByDropDown, slotByNation, cards[card], 'this.hasADevolvedTrumpingCardBeenPlacedAlready(slotByDropDown, this.regionalOrNationalPartyInWestminster[slotByDropDown][i])', false);
                    }
                } else {
                    news.$('.js-slot-issue-' + slotByNation + ' .js-slot-' +  slotByDropDown).empty();
                    news.$('.js-slot-issue-' + slotByNation + ' .js-slot-' + slotByDropDown).append(cards[card].cloneNode(true));
                    this.addCardToTrumpCardList(slotByDropDown, slotByNation);
                }
                news.pubsub.emit('collection:share:request:' + this.elem, [{
                    'nation': slotByNation,
                    'type': this.elem,
                    'slot': slotByDropDown
                }]);
            }
        },


        loopThroughAndAddCardsToMultipleViews: function (slotByDropDown, slotByNation, card, trumpCheck, addTrump) {
            
            for (var i = this.regionalOrNationalPartyInWestminster[slotByDropDown].length - 1; i >= 0; i--) {
                // The eval here actually makes the code MORE maintainable
                /*jslint evil: true */
                if (eval(trumpCheck) === false) {
                    news.$('.js-slot-issue-' + this.regionalOrNationalPartyInWestminster[slotByDropDown][i] + ' .js-slot-' +  slotByDropDown).empty();
                    news.$('.js-slot-issue-' + this.regionalOrNationalPartyInWestminster[slotByDropDown][i] + ' .js-slot-' + slotByDropDown).append(card.cloneNode(true));
                    if (addTrump) {
                        this.addCardToTrumpCardList(slotByDropDown, slotByNation);
                    }
                }
            }
        },

        addCardToTrumpCardList: function (outerKey, innerKey) {
            if (typeof this.trumpCardPlaced[outerKey] === 'undefined') {
                this.trumpCardPlaced[outerKey] = {};
            }
            this.trumpCardPlaced[outerKey][innerKey] = true;
        },

        hasADevolvedTrumpingCardBeenPlacedAlready: function (outerKey, innerKey) {
            if (typeof this.trumpCardPlaced[outerKey] === 'undefined') {
                return false;
            } else if (typeof this.trumpCardPlaced[outerKey][innerKey] === 'undefined') {
                return false;
            } else {
                return true;
            }
        },

        applyFilters: function (filter) {
            news.$('.collection-view-container').removeClass(function (index, css) {
                return (css.match(/\bissue-guide__filter-\S+/g) || []).join(' ');
            });
            news.$('.collection-view-container').addClass('issue-guide__filter-' + filter);
        },

        addRefreshMask: function () {
            news.$('.issue-guide__cards--collection--' + this.elem).append('<div class="js-loading-spinner"></div>');
            news.$('.issue-guide__cards--collection--' + this.elem).addClass('js-load-mask');
        },

        removeRefreshMask: function () {
            news.$('.js-loading-spinner').remove();
            news.$('.issue-guide__cards--collection--' + this.elem).removeClass('js-load-mask');
        },

        makeApiCall: function (request) {
            this.changeState(request);
            news.pubsub.emit('model:card:request', [{
                'requestor': 'collection:view:' + this.elem,
                'endpoint': this.buildEndPoint(request),
                'staticHost': this.whatHost(request)
            }]);
        },

        buildEndPoint: function (request) {
            return '/indepthtoolkit/issues-guide/' + request['type'] + '/' + request['selection'] + '/policies';
        },

        whatHost: function (request) {
            return false;
        },

        changeState: function (item) {
            this.state = item['selection'];
            this.dataState = item;
        },

        changeCta: function () {
            this.collectionPane.find('.js-filter--view .guide-card__cta').html('Add to my manifesto');
        },

        windowWidth: function () {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        }

    };

    return CollectionView;

});