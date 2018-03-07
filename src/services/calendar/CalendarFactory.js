import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'

export class CalendarFactory {
	buildCalendar(selector){
		return new Calendar(selector);
	}

	buildEventBuilder(calendar){
		return new EventBuilder(calendar);
	}
}