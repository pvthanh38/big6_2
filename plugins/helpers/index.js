var decode = require('ent/decode');


module.exports = {
	toName: function (string) {
		return decode(string);
	},
	contentFilter: function (content) {
		var str = content.content.extended;
		const regex = /\[(\[?)(wp_caption|caption|gallery|playlist|audio|video|embed|product|product_page|product_category|product_categories|add_to_cart|add_to_cart_url|products|recent_products|sale_products|best_selling_products|top_rated_products|featured_products|product_attribute|related_products|shop_messages|woocommerce_order_tracking|woocommerce_cart|woocommerce_checkout|woocommerce_my_account|woocommerce_messages|accordion|button|calendar|call_to_action|column|divider|icon|icon_box|map|media_image|media_video|notification|row|section|special_heading|table|tabs|team_member|testimonials|text_block|widget_area|contact_form_steps|contact_info|icon_text|line_break|look_book|slider|contact_form)(?![\w-])([^\]\/]*(?:\/(?!\])[^\]\/]*)*?)(?:(\/)\]|\](?:([^\[]*(?:\[(?!\/\2\])[^\[]*)*)\[\/\2\])?)(\]?)/g;
		while ((m = regex.exec(str)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			var matches = [];
			m.forEach(function(match, groupIndex){
				//console.log(`Found match, group ${groupIndex}: ${match}`);
				//console.log(groupIndex, match);
				matches.push(match);
			});
			var replace = "<div class='big-caption-container'><div class='big-caption'>" + matches[5] +"</div></div>";
			str = str.replace(matches[0], replace);
			//console.log(matches[0],matches[5]);
		}
		content.content.extended = str;
		return content;
	}
};
