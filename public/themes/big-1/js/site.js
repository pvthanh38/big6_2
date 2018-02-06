jQuery(document).ready(function($) {

	$('.menu-stack a').on('click', function(e) {
		e.preventDefault();
		$('.site-header .top-menu-outer').stop(true, true).slideToggle(400);
	});

	function _onResize() {
		menu = $('.site-header .top-menu-outer');

		if ( $(window).width() > 560 ) {
			menu.css('display', 'block');
		} else {
			menu.css('display', 'none');
		}
	}

	$(window).resize(function(event) {
		_onResize();
	});

});