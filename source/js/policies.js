define([
    'lib/news_special/bootstrap',
    'issues'
], function (news, IssuesView) {

    var Policies = function () {
        this.el = $('.page__policies');
        this.barsContainer = this.el.find('.policy_breadcrumbs--bars');
        this.policyCountText = this.el.find('#policy-count-text');
        this.issuesEl = $('.page__issues');
        this.policyHeaderText = this.el.find('#policy-header--name');
        this.policyHeaderIcon = this.el.find('#policy-icon');
        this.policyBreadcrumbText = this.el.find('#policy-name-text');

        this.el.find('.start-again').on('click', this.startAgain);
        this.el.find('#skip-policy').on('click', $.proxy(this.skipPolicy, this));

        news.pubsub.on('policy:confirmed', $.proxy(this.processPolicy, this));
    };

    Policies.prototype = {

        setPolicies: function (polcies) {
            this.userPolicies = polcies;
            this.selectedPolicies = [];
            this.policyPosition = 0;

            this.setupPolicyBreadcrumbs();

        },

        showNextPolicy: function () {
            if (this.policyPosition < this.userPolicies.length) {
                var policyKey = this.userPolicies[this.policyPosition];
                this.setPolicyHeaderText(policyKey);
                console.log(policyKey);
                news.pubsub.emit('collection:view:show-policy', policyKey);
                this.updatePolicyBreadcrumbs();

                this.policyPosition++;
            } else {
                news.pubsub.emit('results:show', [this.selectedPolicies]);
            }
        },

        setupPolicyBreadcrumbs: function () {
            var barsHtml = '',
                percentage = (100 / this.userPolicies.length).toString() + '%';

            for (var i = 0; i < this.userPolicies.length; i++) {
                barsHtml += '<div class="policy_breadcrumbs--bar" style="width: ' + percentage + '"></div>';
            }

            this.barsContainer.html(barsHtml);
            this.updatePolicyBreadcrumbs();
        },

        setPolicyHeaderText: function (policyKey) {
            var policyText = this.issuesEl.find('[data-issue="' + policyKey + '"]').text();

            this.policyHeaderText.text(policyText);
            this.policyBreadcrumbText.text(policyText);
            this.policyHeaderIcon.attr('class', 'icon icon__' + policyKey);
        },

        updatePolicyBreadcrumbs: function () {
            var policyBars = this.barsContainer.find('.policy_breadcrumbs--bar'),
                Policies = this;

            policyBars.removeClass('policy_breadcrumbs--bar__active');

            policyBars.each(function (index) {
                if (index <= Policies.policyPosition) {
                    $(this).addClass('policy_breadcrumbs--bar__active');
                }
            });

            this.policyCountText.text('Policy ' + (this.policyPosition + 1) + ' of ' + this.userPolicies.length);

        },

        startAgain: function () {
            news.pubsub.emit('reset');
        },

        processPolicy: function (policyId) {
            this.selectedPolicies.push(policyId);
            this.showNextPolicy();
        },

        skipPolicy: function () {
            news.pubsub.emit('issue:skipped');
            this.showNextPolicy();
        }

    };

    return Policies;
});