define(function () {
	return '<div class="idt-share ns__share-dropdown">' +
                '<div class="idt-share__button">' +
					'<button class="nav-button nav-button__share"><span class="share-icon"></span> <&=header &></button>' +
				'</div>' +
		  	  	'<span class="idt-share__overlay">' +
			  	  	'<p><&= header &></p>' +
			  	  	'<ul>' +
			  	  		'<& for ( var i = 0; i < networks.length; i++ ) { &>' +
			  	  			'<li class="idt-share__tool idt-share__tool--<&=networks[i].target &>"><a id="<&=networks[i].target &>__share-button" href="#" target="_blank" data-window-width="626" data-window-height="236" data-network="<&=networks[i].target &>" tabindex="1" class="s-b-p-a istats-notrack"> <span> <i aria-hidden="true" class="gelicon gelicon--<&=networks[i].target &>"></i></span><&=networks[i].target.charAt(0).toUpperCase() + networks[i].target.slice(1) &></a></li>' +
			  	  		'<& } &>' +
			  	  	'</ul>' +
			  	  	'<a href="#" class="idt-share__overlay-close" tabindex="4"></a>' +
			  	 '</span>' +
		  	 '</div>';
});