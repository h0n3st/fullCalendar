import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'

export class CalendarFactory {
	getCalendar(selector){
		return new Calendar(selector);
	}

	getEventBuilder(calendar){
		return new EventBuilder(calendar);
	}
}