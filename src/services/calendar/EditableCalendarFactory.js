import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'
import {CalendarFactory} from './CalendarFactory'

export class EditableCalendarFactory extends CalendarFactory {

	constructor(initialColor, selectedColor, maximumDuration) {
		super();
		this.color = initialColor;
		this.selectedColor = selectedColor;
		this.maxDuration = maximumDuration;
	}

	buildCalendar(selector){
		const calendar = super.buildCalendar(selector);

		const builder = this.buildEventBuilder(calendar);

		calendar.addCalendarFunction('onSelection', (calendar, start, end, eventsWithin) => {
				
			calendar.unselectEvents();

			if(eventsWithin.length === 0 && builder) {

				const id = calendar.getHighestEventId() + 1;

				const event = builder.createEvent(id,start,end);

				const differenceInMs = event.getDuration();
				const differenceInMins = differenceInMs / 1000 / 60;

				if(this.validEventDuration(differenceInMins)){
				  calendar.addEvent(event);
				}
			} 
			else {
				eventsWithin.forEach((event) => event.select());
			}
		});

		return calendar;
	}

	buildEventBuilder(calendar){
		const builder = super.buildEventBuilder(calendar);

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

	    builder.appendActionCallback('select', (event) => {
	        event.setColor('black');
	    });

	    builder.appendActionCallback('unselect', (event) => {
	    	event.reinitializeColor();
	    });

	    builder.appendActionCallback('initialize', (event, calendar) => {
	        event.setEditable(true);
	        event.setSelectable(true);
	        event.setColor('green');
	    });

	    builder.appendActionCallback('resize', (event, calendar) => {
	    	if(!this.validEventDuration(event.getLength())){
	    		event.revert();
	    	}
	    });

		return builder;
	}

	validEventDuration(durationInMinutes){
		return durationInMinutes <= this.maxDuration;
	}
}