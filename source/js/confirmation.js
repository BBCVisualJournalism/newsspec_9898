define([
    'lib/news_special/bootstrap'
], function (news) {

    var Confirmation = function () {
        this.currentPolicyId = '';
        this.el = $('.policies__card-container');
        this.focusCardMarkup = $('#focused-card-tmpl').html();

        news.pubsub.on('popup:confirm:issue', $.proxy(this.confirmPolicy, this));
        news.pubsub.on('collection:view:resize', $.proxy(this.addFocus, this));
        this.el.on('click', '#cancel-button', $.proxy(this.reset, this));
        this.el.on('click', '#confirm-button', $.proxy(this.acceptPolicy, this));
        news.pubsub.on('reset', $.proxy(this.reset, this));
        news.pubsub.on('issue:skipped', $.proxy(this.reset, this));
    };

    Confirmation.prototype = {
        confirmPolicy: function (policyId) {
            var cardElm = this.getCardByPolicyId(policyId),
                timeoutDelay = 400,
                confirmation = this;

            this.currentPolicyId = policyId;

            this.el.addClass('policies__card-container--confirm');

            if (cardElm.parents('.issue-guide__cards--column-sec').length > 0) {
                this.el.addClass('policies__card-container--confirm__sec');
                timeoutDelay = 600;
            }

            this.focusCard();

            setTimeout(function () {
                confirmation.focusCardAddedElm.fadeIn(500);
            }, timeoutDelay);
        },

        getCardByPolicyId: function (policyId) {
            var containerString = this.el.find('#js-issue-collection-view-container').attr('class'),
                selectedNationMatch = containerString.match(/issue-guide__filter-([a-z]*)/mi),
                selectedNation = selectedNationMatch[1];

            return this.el.find('.issue-guide__cards--collection--slot.js-slot-issue-' + selectedNation + ' #card-' + policyId);
        },

        focusCard: function () {
            var cardElm = this.getCardByPolicyId(this.currentPolicyId);

            this.focusCardAddedElm = $(this.focusCardMarkup);

            cardElm.addClass('focused-card guide-card--expanded');
            cardElm.parent().append(this.focusCardAddedElm);
        },

        addFocus: function () {
            this.focusCard();
            this.focusCardAddedElm.show();
        },

        reset: function () {
            var Confirmation = this,
            timeoutDelay = 0;


            if ($('.policies__card-container--confirm__sec').length > 0) {
                this.el.removeClass('policies__card-container--confirm__sec');
                timeoutDelay = 600;
            }

            if (this.focusCardAddedElm) {
                this.focusCardAddedElm.remove();
            }
        
            setTimeout(function () {
                Confirmation.el.removeClass('policies__card-container--confirm');
                $('.focused-card').removeClass('focused-card');
            }, timeoutDelay);

            this.currentPolicyId = '';
        },

        acceptPolicy: function () {
            news.pubsub.emit('policy:confirmed', [this.currentPolicyId]);
            this.reset();
        }
    };

    return Confirmation;
});