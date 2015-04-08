define([
    'lib/news_special/bootstrap'
], function (news) {

    var Confirmation = function () {
        this.el = $('.policy-cards');
        news.pubsub.on('popup:confirm:issue', $.proxy(this.confirmPolicy, this));
    };

    Confirmation.prototype = {
        confirmPolicy: function (policyId) {
            var cardElm = this.el.find('#card-' + policyId);
            cardElm.addClass('focused-card');

            this.el.addClass('policy-cards--confirm');

            if (cardElm.parents('.issue-guide__cards--column-sec').length > 0) {
                this.el.addClass('policy-cards--confirm__sec');
            }
        }
    };

    return Confirmation;
});