define([
    'lib/news_special/bootstrap'
], function (news) {

	function IssuesView() {
		this.elm = $('.page__issues');
		this.issues = this.elm.find('.issues .issue');
		console.log(this.issues);

		/* LISTENERS */
		this.issues.on('click', $.proxy(this.issueClicked, this));
	}

	IssuesView.prototype = {
		issueClicked: function (event) {
			var issueElm = $(event.currentTarget);
			issueElm.toggleClass('issue__checked');
		}
	}

	return IssuesView;
});