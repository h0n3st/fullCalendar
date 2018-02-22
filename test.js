
class Calendar {
	constructor(selector) {
		this.selector = selector;
		this.events = [];
		this.views = [];
		this.defaultView = null;
		this.builder = null;
		this.printed = false;
	}
	print(jsonData) {
		if (this.printed) {
			this.reprint();
			return;
		}

        jsonData.editable = true;
        jsonData.selectable = true;
        jsonData.events = this.events;

        jsonData.viewRender = () => {
        	this.reprint();
        };

        jsonData.select = (start, end) => {

            const eventsWithin = this.getEventsWithin(start, end);

            if(eventsWithin.length === 0 && builder) {
                //if no other events are within the start and end
                const newEvent = this.builder.createEvent(this.getHighestId() + 1, 'test', start, end);
                this.addEvent(newEvent);
            } 
            else {
                this.unselectEvents();
                eventsWithin.forEach((event) => event.select());
            }
            this.rerenderEvents();
        };

        jsonData.eventClick = (event) => {
            this.getEvent(event.id).manageAction('click', event);
            this.rerenderEvents();
        };

        jsonData.eventDrop = (event) => {
            this.getEvent(event.id).manageAction('drag', event);
            this.rerenderEvents();
        };

        jsonData.eventResize = (event) => {
            this.getEvent(event.id).manageAction('resize', event);
            this.rerenderEvents();
        };

        $(this.selector).fullCalendar(jsonData);
        this.printed = true;

	}

	canCreateEvents(builder) {
		this.builder = builder;
	}

	getHighestId() {
		return this.events.map((event) => {
			return event.id;
		}).reduce((max, currValue) => {
			return (currValue > max) ? currValue : max;
		});
	}

	getEventsWithin(start, end) {
		const startTime = (new Date(start)).getTime();
		const endTime = (new Date(end)).getTime();

		return this.events.map((event) => {
			return {
				event: event,
				start: (new Date(event.start)).getTime(),
				end: (new Date(event.end)).getTime()
			};
		}).filter((value) => {
			return (value.start >= startTime && value.start <= endTime) || 
					(value.end >= startTime && value.end <= endTime);
		}).map((value) => value.event);
	}

	getEvent(id) { 	
		return this.events.find((event) => event.id == id);
	}

	getSelectedEvents() {
		return this.events.filter((event) => event.isSelected());
	}

	unselectEvents() {
		this.events.forEach((event) => (event.isSelected()) ? event.unselect() : null);
	}

	addEvent(event) {
		this.events.push(event);
	}

	removeEvent(id) {
		this.events = this.events.filter((event) => events.id == id);
		$(this.selector).fullCalendar('removeEvents', id);
	}

	rerenderEvents() {

		const eventsToRender = this.events.filter((event) => event.needsRendering());

		eventsToRender.forEach((event) => $(this.selector).fullCalendar('removeEvents', event.id))

        $(this.selector).fullCalendar('renderEvents', eventsToRender);

        eventsToRender.forEach((event) => event.setMustBeRendered(false));
	}

	//Fully reprint events, shouldn't be used
	reprint() {
		this.events.forEach((event) => event.setMustBeRendered(true));
		this.rerenderEvents();
	}
}

class BaseEventBuilder {
	constructor(calendar) {
		this.calendar = calendar;
	}

	createEvent(id, title, start, end) {
		const event = this.instantiateEvent();
        this.fillEvent(event, id, title, start, end);
		return event;
	}

	instantiateEvent() {
		return new BaseEvent(this.calendar);
	}

	fillEvent(event, id, title, start, end) {
		event.setId(id);
		event.setTitle(title);
		event.setStart(start);
		event.setEnd(end);
	}
}

class EditableEventBuilder extends BaseEventBuilder{

	instantiateEvent() {
		return new EditableEvent(this.calendar);
	}

	fillEvent(event, id, title, start, end) {
		super.fillEvent(event,id,title,start,end);
		event.setColor('blue');
		event.setEditable();
	}
}

class AbstractEvent{
	constructor(calendar, id, start, end) {
		this.id = id;
		this.calendar = calendar;
		this.editable = false;
		this.initialColor = null;
	}

	setId(id) { 
		this.setProperty('id', id);
	}
	setTitle(title)	{
		this.setProperty('title', title);		
	}
	setStart(start)	{
		this.setProperty('start', start);		
	}
	setEnd(end)	{
		this.setProperty('end', end);			
	}
	setEditable() {
		this.setProperty('editable', true);	
	}
	setColor(color) {
		this.setProperty('color', color);
		if (!this.initialColor) {
			this.setProperty('initialColor', color);
		}
	}
	setProperty(key, value) {
		this[key] = value;
	}
	isInitialColor() {
		return this.color == this.initialColor;
	}
	reinitializeColor() {
		this.setProperty('color', this.initialColor);
	}
	pullDataFrom(jsonEvent) {
		for(const key in jsonEvent) {
			this[key] = jsonEvent[key];
		}
	}
}

class InitializableEvent extends AbstractEvent{
	constructor(calendar, id, start, end){
		super(calendar, id, start, end);
		this.onInitialize();
	}

	onInitialize() {}
}

class RenderableEvent extends InitializableEvent{
	constructor(calendar, id, start, end) {
		super(calendar, id, start, end);
		this.modified = false;
	}
	setProperty(key,value) {
		if(this[key] != value) {
			this.setMustBeRendered(true);
		}
		super.setProperty(key,value);
	}
	setMustBeRendered(mustRender) {
		this.modified = mustRender;
	}
	needsRendering() {
		return this.modified;
	}
}

class ActionnableEvent extends RenderableEvent{
	constructor(calendar, id, start, end){
		super(calendar, id, start, end);
		this.actionFunctions = {
			drag: () => { 
				this.onEventDrag(); 
			},
			click: () => { 
				this.onEventClick(); 
			},
			resize: () =>  { 
				this.onEventResize(); 
			}
		};
	}
	
	manageAction(actionCode, event) {
		this.manageAction(actionCode, event, {});
	}

	manageAction(actionCode, event) {
		this.pullDataFrom(event);
		this.actionFunctions[actionCode]();
	}

	onEventDrag() {}
	onEventResize() {}
	onEventClick() {}
}

class selectableEvent extends ActionnableEvent{
	constructor(calendar, id, start, end) {
		super(calendar, id, start, end); 
		this.selected = false;
	}

	select() {this.setProperty('selected', true);}
	unselect() {this.setProperty('selected', false);}

	isSelected() {return this.selected;}
}

class revertableEvent extends selectableEvent{
	manageAction(actionCode, event) {
		this.saveData();
		super.manageAction(actionCode,event);
		this.clearSavedData();
	}

	saveData() {
		const initialData = {};
		for(const key in this) {
			initialData[key] = this[key];
		}

		this.initialData = initialData;
	}

	clearSavedData() {
		this.initialData = undefined;
	}
	revert() {
		this.pullDataFrom(this.initialData);
		this.setMustBeRendered(true);
	}
}



class BaseEvent extends revertableEvent{
}

class EditableEvent extends BaseEvent{
	onInitialize() {
		this.setColor("blue");
		this.setEditable();
	}
	onEventClick() {
		const initiallySelected = this.isSelected();
		
		this.calendar.unselectEvents();

		if(!initiallySelected){
			this.select();
		}
	}
	onEventDrag() {
		if(!this.isSelected()) {
			this.revert();
			this.setColor('red');
		}
	}
	onEventResize() {
		if(!this.isSelected()) {
			this.revert();
			this.setColor('red');
		}
	}
	select() {
		super.select();
		this.setColor('green');
	}
	unselect() {
		super.unselect();
		this.reinitializeColor();
	}
}