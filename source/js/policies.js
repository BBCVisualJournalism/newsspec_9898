define([
    'lib/news_special/bootstrap',
    'issues'
], function (news, IssuesView) {

    var Policies = function () {
        this.el = $('.page__policies');
        this.issuesEl = $('.page__issues');
        this.policyHeaderText = this.el.find('#policy-header--name');
        news.pubsub.on('popup:confirm:issue', $.proxy(this.showNextPolicy, this));
        this.el.find('.start-again').on('click', this.startAgain);
    };

    Policies.prototype = {

        setPolicies: function (polcies) {
            this.userPolicies = polcies;
            this.policyPosition = 0;

            this.addPolicyBars();

        },

        showNextPolicy: function () {
            if (this.policyPosition < this.userPolicies.length) {
                var policyKey = this.userPolicies[this.policyPosition];
                this.setPolicyHeaderText(policyKey);
                news.pubsub.emit('collection:view:show-policy', policyKey);

                this.policyPosition++;
            } else {
                news.pubsub.emit('results:show');
            }
        },

        addPolicyBars: function () {

        },

        setPolicyHeaderText: function (policyKey) {
            var policyText = this.issuesEl.find('[data-issue="' + policyKey + '"]').text();

            this.policyHeaderText.text(policyText);
        },

        updatePolicyBars: function () {
            var policyBars = $('.policy-bar');
            policyBars.removeClass('policy-bar__complete');

            policyBars.each(function (index) {
                if (index <= this.policyPosition) {
                    $(this).addClass('policy-bar__complete');
                }
            });

        },

        startAgain: function () {
            news.pubsub.emit('reset');
        }

    };

    return Policies;
});