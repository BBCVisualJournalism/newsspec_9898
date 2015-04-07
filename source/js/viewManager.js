define([
    'lib/news_special/bootstrap',
    'issues',
    'policies'
], function (news, IssuesView, PoliciesView) {

    function ViewManager() {
        this.issueView = new IssuesView();
        this.policiesView = new PoliciesView();

        this.issuesPage = $('.page__issues');
        this.policiesPage = $('.page__policies');

        /* LISTENERS */
        news.pubsub.on('policies:chosen', $.proxy(this.policiesChosen, this));
        news.pubsub.on('results:show', $.proxy(this.showResults, this));
    }

    ViewManager.prototype = {

        policiesChosen: function (polcies) {
            this.policiesView.setPolicies(polcies);
            this.policiesView.showNextPolicy();

            this.issuesPage.hide();
            this.policiesPage.show();

            this.updateBreadcrumbs(1);
        },

        showResults: function () {
            this.issuesPage.hide();
            this.policiesPage.hide();

            this.updateBreadcrumbs(2);
        },

        updateBreadcrumbs: function (position) {
            var breadcrumbs = $('.breadcrumb');
            breadcrumbs.removeClass('breadcrumb__active');
            breadcrumbs.removeClass('.breadcrumb__teal');


            breadcrumbs.each(function (index) {
                if (index < position) {
                    $(this).addClass('breadcrumb__teal');
                } else if (index === position) {
                    $(this).addClass('breadcrumb__active');
                }
            });

        }

    };

    return ViewManager;
});