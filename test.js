
class Calendar{
	constructor(selector){
		this.selector = selector;

		this.events = [];
		this.views = [];
		this.defaultView = null;
		this.printed = false;
	}
	print(){
		var selector = this.selector;
		var calendar = this;
		$(selector).fullCalendar({
	    	header:{
	    		left: "prev,next today",
	    		center:"title",
	    		right:this.getViewsList()
	    	},
	    	defaultView:this.getDefaultView(),
	    	businessHours:{
	    		dow:[1,2,3,4,5],
	    		start:"10:00",
	    		end:"18:00"
	    	},
	    	events:this.events,
	    	eventClick: function(event, jsEvent, view){
	    		var currEvent = calendar.getEvent(event.id);
	    		currEvent.onEventClick(calendar, event);
	    		
	    	},
	    	eventDragStart: function(event, jsEvent, ui, view ) {
	    		var currEvent = calendar.getEvent(event.id);
	    		currEvent.onEventDragStart(calendar, event);

	    	},
	    	eventDragStop: function(event,jsEvent,ui,view) {
	    		var currEvent = calendar.getEvent(event.id);
		    	currEvent.onEventDragStop(calendar, event);
		    	
		    }
	        // put your options and callbacks here
	    });
	    this.printed = true;
		
	}
	getEvent(id){ 	
		event = null;
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].id == id){
				event = this.events[i];
				break;
			}
		}
		return event;
	}
	printEvent(event){
		$(this.selector).fullCalendar("renderEvent", event);
	}
	addView(view){
		this.views.push(view);
		if(this.defaultView == null){
			this.setDefaultView(view);
		}
	}
	
	getDefaultView(){
		return this.defaultView;
	}

	setDefaultView(view){
		this.defaultView = view;
	}

	getViewsList(){
		return this.views.join(",");
	}

	addEvent(event){
		this.events.push(event);
		if(this.printed){
			this.printEvent(event);
		}
	}

	setEvent(event){
		for(var i = 0 ; i < this.events.length ; i++){
			if(this.events[i].id == event.id){
				event.copyTo(this.events[i]);
				break;
			}
		}
		
	}
	updateEvents(){
		$(this.selector).fullCalendar("updateEvents",this.events);	
	}
	updateEvent(event){
		$(this.selector).fullCalendar("updateEvent", event);
	}
}

class AbstractEventBuilder{
	constructor(calendar){
		this.calendar = calendar;
	}
	createEvent(id,title,start,end){
		var event = this.instantiateEvent();
		return this.fillEvent(event, id, title, start, end);
	}

	instantiateEvent(){
		var event = new AbstractEvent();
		return event;
	}

	fillEvent(event, id,title,start,end){
		event.setId(id);
		event.setTitle(title);
		event.setStart(start);
		event.setEnd(end);
		return event;
	}
}

class EditableEventBuilder extends AbstractEventBuilder{
	constructor(calendar){
		super(calendar);
		this.calendar = calendar;
	}
	createEvent(id,title,start,end){
		return this.fillEvent(this.instantiateEvent(), id, title, start, end);		
	}

	instantiateEvent(){
		return new EditableEvent();
	}

	fillEvent(event, id, title, start, end){
		event = super.fillEvent(event,id,title,start,end);
		event.setEditable();
		event.setColor("blue");
		return event;
	}
}

function copyEvent(event){
	var newEvent = new AbstractEvent();
	for (var key in event) {
		newEvent[key] = event[key];
	}
	return newEvent;
}

class AbstractEvent{
	constructor(){
		this.ressources = [];
	}
	addRessource(ressourceId){
		this.ressources.push(ressourceId);
	}
	setId(id){
		this.id = id;
	}
	setTitle(title){
		this.title = title;
	}
	setStart(start){
		this.start = start;
	}
	setEnd(end){
		this.end = end;
	}
	setColor(color){
		this.color = color;
		if(this.initialColor == undefined){
			this.initialColor = color;
		}
	}
	isInitialColor() {return this.color == this.initialColor}
	reinitializeColor() {this.color = this.initialColor;}
	setEditable(){
		this.editable = true;
	}
	setProperty(key, value){
		this[key] = value;
	}
	copyTo(otherEvent){
		for(var key in this){
			otherEvent[key] = this[key];
		}
	}
	onEventDragStart(calendar, event){}
	onEventDragStop(calendar, event){}
	onEventClick(calendar, event){}
}

class EditableEvent extends AbstractEvent{

	onEventClick(calendar, event){
		if(this.isInitialColor()){
			this.setColor("green");
		}
		else{
			this.reinitializeColor();
		}
		
		this.copyTo(event);
		calendar.updateEvent(event);
	}
	onEventDragStop(calendar, event){
		this.setColor("red");
		this.copyTo(event);
		calendar.updateEvent(event);
	}
}


/*
id	Optional. Useful for getEventSourceById.
color	Sets every Event Object''s color for this source.
backgroundColor	Sets every Event Object''s backgroundColor for this source.
borderColor	Sets every Event Object''s borderColor for this source.
textColor	Sets every Event Object''s textColor for this source.
className	Sets every Event Object''s className for this source.
editable	Sets every Event Object''s editable for this source.
startEditable	Sets every Event Object''s startEditable for this source.
durationEditable	Sets every Event Object''s durationEditable for this source.
resourceEditable	Sets every Event Object''s resourceEditable for this source.
rendering	Sets every Event Object''s rendering for this source.
overlap	Sets every Event Object''s overlap for this source.
constraint	Sets every Event Object''s constraint for this source.
allDayDefault	Sets the allDayDefault option, but only for this source.
eventDataTransform	Sets the eventDataTransform callback, but only for this source.

*/

