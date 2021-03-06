import { LightResponse } from '@corcc/nvr/lib/util/type';
import cheerio, { CheerioAPI } from 'cheerio';
const loadCheerio = cheerio.load;
const ov = Object.values;

export function getDataKeyFromResponseBody ({
	responseCode,
	body,
	headers
}: LightResponse): string {
	if (responseCode != 200) {
		throw new Error();
	}
	const infoCheerio: CheerioAPI = loadCheerio(body);
	return infoCheerio('[data-key]').attr()['data-key'];
}

export function getVaccinesFromResponseBody ({
	responseCode,
	body,
	headers
}: LightResponse): {
	org: string;
	key: string;
	vaccines: any;
} {
	if (responseCode != 200) {
		throw new Error();
	}
	const infoCheerio: CheerioAPI = loadCheerio(body);
	const vaccineRadioItems = infoCheerio('ul > li.radio_item');
	const org = infoCheerio('.h_title > span').text().trim();
	const vaccines: any = ov(vaccineRadioItems)
		.filter((_) => typeof _.attribs != 'undefined')
		.map(
			(
				vaccineRadioItem
			): {
				[x: string]:
				| string
				| {
					[x: string]: string;
				};
			} => {
				const vaccineRadioItemCheerio = loadCheerio(vaccineRadioItem);
				const vaccineInput = vaccineRadioItemCheerio('input')[0];
				const vaccineInputAttribs = vaccineInput.attribs;
				let vaccine: {
					[x: string]: string;
				} = { '': '' };
				const cd = vaccineInputAttribs['data-cd'];
				const name = vaccineInputAttribs['data-name'];
				const quantity = vaccineRadioItemCheerio('label > .num_box > .num')
					.text()
					.trim();
				const notice = vaccineRadioItemCheerio('label > .num_box > .notice')
					.text()
					.trim();
				const { disabled } = vaccineInputAttribs;
				vaccine = {
					cd,
					name,
					disabled,
					quantity,
					notice
				};
				console.log(vaccine);
				return vaccine;
			}
		);
	return {
		org,
		key: infoCheerio('[data-key]').attr()['data-key'],
		vaccines
	};
}
