define([
    'lib/news_special/bootstrap'
], function (news) {

	function IssuesView() {
		this.elm = $('.page__issues');
		this.issues = this.elm.find('.issues .issue');
		this.submitButton = $('.nav-buttons #choose-policy');

		/* LISTENERS */
		news.pubsub.on('reset', $.proxy(this.reset, this));
		this.issues.on('click', $.proxy(this.issueClicked, this));
		this.submitButton.on('click', $.proxy(this.submit, this));
	}

	IssuesView.prototype = {

		issueClicked: function (event) {
			var issueElm = $(event.currentTarget || event.srcElement);
			issueElm.toggleClass('issue__checked');

			if (this.issues.filter('.issue__checked').length > 0) {
				this.submitButton.addClass('nav-button__active');
			} else {
				this.submitButton.removeClass('nav-button__active');
			}
		},

		submit: function () {
			var selectedOptions = [];
			this.issues.filter('.issue__checked').each(function () {
				selectedOptions.push($(this).data('issue'));
			});
			if (selectedOptions.length > 0) {
				news.pubsub.emit('policies:chosen', [selectedOptions]);
			}
		},

		reset: function () {
			this.elm.find('.issue__checked').removeClass('issue__checked');
		}

	};

	return IssuesView;
});