import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'
import {CalendarFactory} from './CalendarFactory'

export class SelectableCalendarFactory extends CalendarFactory {
	buildCalendar(selector){
		const calendar = super.buildCalendar(selector);

		calendar.addCalendarFunction('onSelection', (calendar, start, end, eventsWithin) => {

			console.log(start.toString(), end.toString(), eventsWithin);

			calendar.unselectEvents();
			if(eventsWithin.length > 0){
				eventsWithin[0].manageAction('select');
			}
		});

		return calendar;

	}

	buildEventBuilder(calendar){
		const builder = super.buildEventBuilder(calendar);

		builder.appendActionCallback('onClick',  (event, calendar) =>{
	        const eventIsInitiallySelected = event.isSelected();

	        calendar.unselectEvents();
	        if(eventIsInitiallySelected){
	          event.manageAction('unselect');
	        }
	        else{
	          event.manageAction('select');
	        }
	    });

	    builder.appendActionCallback('onSelection', (event) =>  {
	    	event.setColor('black');
	    });

	    builder.appendActionCallback('onUnselection', (event) => {
	    	event.reinitializeColor();
	    });

		return builder;
	}
}