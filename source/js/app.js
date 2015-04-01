define(['lib/news_special/bootstrap', 'nation-filter', 'lib/news_special/share_tools/controller'], function (news, NationFilter, ShareTools) {
    
	addNationFilterToView();
    news.sendMessageToremoveLoadingImage();

    function addNationFilterToView() {
   		new NationFilter({
   			'state': 'uk'
   		});
    }

});