define(function () {
    return '<div class="idt-share ns__share">' +
                '<button class="nav-button"><&=header &></button>' +
                '<ul class="idt-share__tools ">' +
                    '<& for ( var i = 0; i < networks.length; i++ ) { &>' + 
                        '<li class="idt-share__tool idt-share__tool--<&=networks[i].target &>">' +
                            '<a>' + 
                                '<span><&=networks[i].target.charAt(0).toUpperCase() + networks[i].target.slice(1) &></span>' +
                            '</a>' + 
                        '</li>' +
                    '<& } &>' +
                '</ul>' +
            '</div>';
});