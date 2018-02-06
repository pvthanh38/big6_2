(function () {
    $(document).ready(function () {
        $('.menu-toggle').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $('.nav-head').slideToggle();
        });

        $(document).click(function () {
            if ($(window).width() < 1024){
                $('.nav-head').slideUp();
            }
        });
    });
})(jQuery);