define([
    'lib/news_special/bootstrap',
    'issues',
    'policies',
    'confirmation',
    'results'
], function (news, IssuesView, PoliciesView, ConfirmationView, ResultsView) {

    function ViewManager(options) {
        this.issueView = new IssuesView();
        this.policiesView = new PoliciesView();
        this.confirmationView = new ConfirmationView();
        this.resultsView = new ResultsView({partyNames: options.partyNames});

        this.issuesPage = $('.page__issues');
        this.policiesPage = $('.page__policies');
        this.resultsPage = $('.page__results');
        this.noCardsPage = $('.page__no-cards');

        /* LISTENERS */
        news.pubsub.on('policies:chosen', $.proxy(this.policiesChosen, this));
        news.pubsub.on('results:show', $.proxy(this.showResults, this));
        news.pubsub.on('results:load-from:share', $.proxy(this.showResults, this));
        news.pubsub.on('reset', $.proxy(this.reset, this));
    }

    ViewManager.prototype = {

        policiesChosen: function (polcies) {
            this.policiesView.setPolicies(polcies);
            this.policiesView.showNextPolicy();

            this.issuesPage.hide();
            this.resultsPage.hide();
            this.policiesPage.show();

            this.updateBreadcrumbs(1);

            news.pubsub.emit('istats', ['nav-section', 'newsspec-interaction', 'issues-chosen']);
        },

        showResults: function (chosenPolicies) {
            this.issuesPage.hide();
            this.policiesPage.hide();

            if (chosenPolicies.length > 0) {
                this.noCardsPage.hide();
                this.resultsPage.show();
            } else {
                this.resultsPage.hide();
                this.noCardsPage.show();
            }


            this.updateBreadcrumbs(2);
        },

        updateBreadcrumbs: function (position) {
            var breadcrumbs = $('.breadcrumb');
            breadcrumbs.removeClass('breadcrumb__active');
            breadcrumbs.removeClass('breadcrumb__teal');


            breadcrumbs.each(function (index) {
                if (index < position) {
                    $(this).addClass('breadcrumb__teal');
                } else if (index === position) {
                    $(this).addClass('breadcrumb__active');
                }
            });

        },

        reset: function () {
            this.updateBreadcrumbs(0);

            this.policiesPage.hide();
            this.resultsPage.hide();
            this.issuesPage.show();
            news.pubsub.emit('window:scrollTo', [0, 0]);
        }

    };

    return ViewManager;
});