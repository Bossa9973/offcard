import assert from 'node:assert/strict';
import test from 'node:test';
import { activityFilters, activitySearch } from '../src/ui/report-navigation';

test('report drilldown links preserve the selected window, currency and movement filters', () => {
 const filters = { currency: 'cbBTC', postedAfter: '2026-08-01T00:00:00.000Z', postedBefore: '2026-09-01T00:00:00.000Z', direction: 'money_out' as const, lineTypes: ['card_spend_authorization', 'card_spend_refund'], resourceId: 'icrd_demo1' };
 assert.deepEqual(activityFilters(new URLSearchParams(activitySearch(filters)).toString()), filters);
});
test('an unfiltered history link does not invent a date or currency restriction', () => {
 assert.deepEqual(activitySearch({}), {});
 assert.deepEqual(activityFilters(''), {});
});
test('malformed deep-link filters are dropped rather than forwarded to Elements', () => {
 assert.deepEqual(activityFilters('?currency=../usd&after=garbage&direction=all&types=card_spend_refund,bad%20type&resource=%3Cscript%3E'), { lineTypes: ['card_spend_refund'] });
});
