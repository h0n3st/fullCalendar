import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'
import {CalendarFactory} from './CalendarFactory'

export class SelectableCalendarFactory extends CalendarFactory {
	getCalendar(selector){
		const calendar = super.getCalendar(selector);

		calendar.addCalendarFunction('onSelection', (calendar, start, end, eventsWithin) => {
				
			calendar.unselectEvents();

			const firstSelectableEvent = eventsWithin.find((event) => event.isSelectable());
			if(firstSelectableEvent) {
				firstSelectableEvent.select();
			}
		});

		return calendar;
	}

	getEventBuilder(calendar){
		const builder = super.getEventBuilder(calendar);

		builder.appendActionCallback('click',  (event, calendar) =>{
	        const eventIsInitiallySelected = event.isSelected();

	        calendar.unselectEvents();
	        if(eventIsInitiallySelected){
	          event.unselect();
	        }
	        else{
	          event.select();
	        }
	    });

	    builder.appendActionCallback('select', (event) =>  {
	    	event.setColor('black');
	    });

	    builder.appendActionCallback('unselect', (event) => {
	    	event.reinitializeColor();
	    });

	    builder.appendActionCallback('initialize', (event) => {
	    	event.setSelectable(true);
	    	event.setColor('blue');
	    });

		return builder;
	}
}