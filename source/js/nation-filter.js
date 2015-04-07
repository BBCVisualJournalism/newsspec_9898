/**
* @fileOverview Visual Journalism Issue Guide - Nation filter
* @author BBC / Steven Atherton
* @version RC1
*/

/** @module nation-filter */
define(['lib/news_special/bootstrap'], function (news) {
    
    var NationFilter = function (config) {
        var opts = config || {};
        if (opts.state) {this.state = opts.state; } else {this.state = 'uk'; }
        this.filterItems = news.$('.js-filter--item');
        this.subscribe();
        this.publish();
        this.changeState(this.state);
    };

    NationFilter.prototype = {
        subscribe: function () {
            var NationFilter = this;
            news.pubsub.on('nation:filter:request', function (data) {
                NationFilter.changeState(data);
            });
        },

        publish: function () {
            var NationFilter = this;
            this.filterItems.on('click', function (event) {
                NationFilter.changeState(news.$(event.currentTarget).attr('data-country'));
            });
        },

        changeState: function (item) {
            var selected;
            selected = $('li[data-country="' + item + '"]');
            this.filterItems.removeClass('nation-filter__countries--item--active');
            selected.addClass('nation-filter__countries--item--active');
            this.state = item;
            console.log('emit filter');
            news.pubsub.emit('nation:filter:change', [this.state]);
            
        }

    };

    return NationFilter;

});