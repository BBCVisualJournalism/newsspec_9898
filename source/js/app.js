define([
    'lib/news_special/bootstrap',
    'issues'
], function (news, IssuesView) {

    new IssuesView();

    news.sendMessageToremoveLoadingImage();
});