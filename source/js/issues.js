define([
    'lib/news_special/bootstrap'
], function (news) {

	function IssuesView() {
		this.elm = $('.page__issues');
		this.issues = this.elm.find('.issues .issue');
		this.submitButton = $('.nav-buttons #choose-policy');

		/* LISTENERS */
		this.issues.on('click', this.issueClicked);
		this.issues.on('mouseenter', this.issueHoverStart);
		this.issues.on('mouseleave', this.issueHoverEnd);
		this.submitButton.on('click', $.proxy(this.submit, this));
	}

	IssuesView.prototype = {

		issueClicked: function (event) {
			var issueElm = $(event.currentTarget);
			issueElm.toggleClass('issue__checked');
			setTimeout(function () {
				issueElm.removeClass('issue__hover');
			}, 20);
		},

		issueHoverStart: function () {
			var issueElm = $(event.currentTarget);
			issueElm.addClass('issue__hover');
		},

		issueHoverEnd: function () {
			var issueElm = $(event.currentTarget);
			issueElm.removeClass('issue__hover');
		},

		submit: function () {
			var selectedOptions = [];
			this.issues.filter('.issue__checked').each(function () {
				selectedOptions.push($(this).data('issue'));
			});
		}

	};

	return IssuesView;
});