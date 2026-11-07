import { mount } from "svelte";
import Demos from "./common/Index.svelte";

import { Willow, WillowDark } from "@svar-ui/svelte-filter";
import { WillowIcon, WillowDarkIcon } from "./assets/icons/index";

mount(Demos, {
	target: document.querySelector("#wx_demo_area") || document.body,
	props: {
		publicName: "Filter",
		productTag: "filter",
		productLink: "filter",
		skins: [
			{
				id: "willow",
				label: "Willow",
				component: Willow,
				icon: WillowIcon,
			},
			{
				id: "willow-dark",
				label: "Dark",
				component: WillowDark,
				icon: WillowDarkIcon,
			},
		],
	},
});
