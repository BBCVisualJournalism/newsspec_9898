define([
    'lib/news_special/bootstrap'
], function (news) {

	function IssuesView() {
		this.elm = $('.page__issues');
		this.issues = this.elm.find('.issues .issue');
		this.submitButton = $('.nav-buttons #choose-policy');

		/* LISTENERS */
		this.issues.on('click', $.proxy(this.issueClicked, this));
		this.submitButton.on('click', $.proxy(this.submit, this));
	}

	IssuesView.prototype = {

		issueClicked: function (event) {
			var issueElm = $(event.currentTarget);
			issueElm.toggleClass('issue__checked');
		},

		submit: function () {
			var selectedOptions = ['test'];
			this.issues.filter('.issue__checked').each(function () {
				selectedOptions.push($(this).data('issue'));
			});
		}

	};

	return IssuesView;
});