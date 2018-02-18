
class Calendar{
	constructor(selector){
		this.selector = selector;

		this.events = [];
		this.views = [];
		this.defaultView = null;
		this.builder = null;
		this.printed = false;
	}
	print(){
		var selector = this.selector;
		var calendar = this;
		var builder = this.builder;
		$(selector).fullCalendar({
	    	header:{
	    		left: "prev,next today",
	    		center:"title",
	    		right:this.getViewsList()
	    	},
	    	defaultView:this.getDefaultView(),
	    	businessHours:this.getBusinessHours(),
	    	editable:true,
	    	selectable:true,
	    	events:this.events,
	    	select: function(start, end){

	    		var eventsWithin = calendar.getEventsWithin(start, end);
	    		
	    		if(eventsWithin.length == 0){
	    			//if no other events are within the start and end
		    		if(builder != null){
		    			var event = builder.createEvent(calendar.getHighestId() + 1, "test", start, end);
		    			calendar.addEvent(event);
		    		}
	    		}
	    		else{
	    			calendar.unselectEvents();
	    			for(var i = 0 ; i < eventsWithin.length; i++){
	    				var event = eventsWithin[i];
	    				event.select();
	    				calendar.reprintEvent(event.id, event);
	    			}
	    		}
	    		
	    	},
	    	eventClick: function(event, jsEvent, view){
	    		var data = {event:event, jsEvent:jsEvent, view:view};
	    		calendar.getEvent(event.id).manageAction("click",event, data);
	    	},
	    	eventDrop: function( event, delta, revertFunc, jsEvent, ui, view ) {
	    		var data = {event:event, delta:delta, revertFunc:revertFunc, jsEvent:jsEvent, ui:ui, view:view};
	    		calendar.getEvent(event.id).manageAction("drag",event,data);
	    	},
	    	eventResize: function( event, delta, revertFunc, jsEvent, ui, view ) {
	    		var data = {event:event, delta:delta, revertFunc:revertFunc, jsEvent:jsEvent, ui:ui, view:view};
	    		calendar.getEvent(event.id).manageAction("resize", event, data);
	    	}

	    });
	    this.printed = true;
		
	}

	setBusinessHours(daysIndex, start, end){
		this.businessHours = {
			dow:daysIndex,
			start:start,
			end:end
		}
	}

	getBusinessHours(){
		return this.businessHours;
	}

	addView(view){
		this.addView(view,false);
	}
	addView(view, isDefault){
		this.views.push(view);
		if(this.defaultView == null || isDefault){
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

	canCreateEvents(builder){
		this.builder = builder;
	}

	getHighestId(){
		var highestId = 0;
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].id > highestId){
				highestId = this.events[i].id;
			}
		}
		return highestId;
	}

	getEventsWithin(start, end){
		var eventsWithin = [];

		start = new Date(start);
		start = start.getTime();

		end = new Date(end);
		end = end.getTime();

		for(var i = 0 ; i < this.events.length; i++){
			var currEvent = this.events[i];
			var eventStart = new Date(currEvent.start);
			eventStart = eventStart.getTime();

			var eventEnd = new Date(currEvent.end);
			eventEnd = eventEnd.getTime();

			console.log(start, end, eventStart, eventEnd);

			if((eventStart >= start && eventStart <= end)
				|| (eventEnd >= start && eventEnd <= end)){
				eventsWithin.push(currEvent);
			}
		}
		return eventsWithin;
	}

	getEvent(id){ 	
		var event = null;
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].id == id){
				event = this.events[i];
				break;
			}
		}
		return event;
	}

	getSelectedEvents(){
		var events = [];
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].isSelected()){
				events.push(this.events[i]);
			}
		}
		return this.events;
	}

	unselectEvents(){
		var events = this.getSelectedEvents();
		for(var i = 0 ; i < events.length; i++){
			if(events[i].isSelected()){
				events[i].unselect();
				this.reprintEvent(events[i].id, events[i]);
			}
		}


	}

	setEvent(id, event){
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].id == id){
				this.events[i] = event;
				break;
			}
		}
	}

	printEvent(event){
		$(this.selector).fullCalendar("renderEvent", event);
	}

	addEvent(event){
		this.events.push(event);
		if(this.printed){
			this.printEvent(event);
		}
	}

	removeEvent(id){
		var newEvents = [];
		for(var i = 0 ; i < this.events ; i++){

			if(this.events[i].id != id){
				newEvents.push(this.events[i]);
			}
		}
		this.events = newEvents;

		$(this.selector).fullCalendar("removeEvents", id);
	}

	reprint(){
		$(this.selector).fullCalendar("removeEvents");
		$(this.selector).fullCalendar("renderEvents", this.events);
	}

	reprintEvent(id){
		this.reprintEvent(id, this.getEvent(id));
	}

	reprintEvent(id, event){
		this.setEvent(id, event);
		$(this.selector).fullCalendar("removeEvents", id);
		$(this.selector).fullCalendar("renderEvent", event);
	}

}

class BaseEventBuilder{
	constructor(calendar){
		this.calendar = calendar;
	}
	createEvent(id,title,start,end){
		var event = this.instantiateEvent();
		return this.fillEvent(event, id, title, start, end);
	}

	instantiateEvent(){
		return new BaseEvent(this.calendar);
	}

	fillEvent(event, id,title,start,end){
		event.setId(id);
		event.setTitle(title);
		event.setStart(start);
		event.setEnd(end);
		return event;
	}
}

class EditableEventBuilder extends BaseEventBuilder{
	constructor(calendar){
		super(calendar);
		this.calendar = calendar;
	}
	createEvent(id,title,start,end){
		return this.fillEvent(this.instantiateEvent(), id, title, start, end);		
	}

	instantiateEvent(){
		return new EditableEvent(this.calendar);
	}

	fillEvent(event, id, title, start, end){
		event = super.fillEvent(event,id,title,start,end);
		event.setEditable();
		event.setColor("blue");
		return event;
	}
}

class AbstractEvent{
	constructor(calendar){
		this.calendar = calendar;
		this.ressources = [];
	}
	addRessource(ressourceId){
		this.ressources.push(ressourceId);
	}
	setId(id)			{ this.id = id;				}
	setTitle(title)		{ this.title = title;		}
	setStart(start)		{ this.start = start;		}
	setEnd(end)			{ this.end = end;			}
	setEditable()		{ this.editable = true;		}
	setSelectable() 	{ this.selectable = true;	} //DOES THIS EVEN WORK, GOTTA CHECK THIS
	setColor(color){
		this.color = color;
		if(this.initialColor == undefined){
			this.initialColor = color;
		}
	}

	isInitialColor() {
		return this.color == this.initialColor
	}
	reinitializeColor() {
		this.color = this.initialColor;
	}

	copyTo(otherEvent){

		for(var key in this){
			otherEvent[key] = this[key];
		}
	}
	copyFrom(otherEvent){
		for(var key in otherEvent){
			this[key] = otherEvent[key];
		}
	}

}
class ActionnableEvent extends AbstractEvent{
	constructor(calendar){super(calendar);}

	manageAction(actionCode, event){
		this.manageAction(actionCode, event, {});
	}

	manageAction(actionCode, event, data){

		this.copyFrom(event);

		switch(actionCode){
			case "drag":
				this.onEventDrag(event, data);
				break;
			case "click":
				this.onEventClick(event, data);
				break;	
			case "resize":
				this.onEventResize(event, data);
				break;

			default:
		}

		this.calendar.reprintEvent(this.id, this);
	}

	onEventDrag(event, data){}

	onEventResize(event, data){}

	onEventClick(event, data){}
}

class selectableEvent extends ActionnableEvent{
	constructor(calendar) {super(calendar); this.selected = false;}

	select(){this.selected = true;}
	unselect(){this.selected = false;}

	isSelected() {return this.selected;}
}

class BaseEvent extends selectableEvent{
	constructor(calendar) {super(calendar)}
}

class EditableEvent extends BaseEvent{
	constructor(calendar){
		super(calendar);
	}
	onEventClick(event, data){

		//Unselect other events
		var selectedEvents = this.calendar.getSelectedEvents();
		for(var i = 0 ; i < selectedEvents.length; i++){
			if(selectedEvents[i].id != this.id && selectedEvents[i].isSelected()){
				selectedEvents[i].unselect();
				this.calendar.reprintEvent(selectedEvents[i].id, selectedEvents[i]);
			}
		}

		if(!this.isSelected()){
			this.calendar.unselectEvents();
			this.select();
		}
		else{
			this.unselect();
		}
	}
	onEventDrag(event, data){
		this.setColor("red");
	}
	onEventResize(event, data){
		this.setColor("yellow");
	}

	select(){
		super.select();
		this.setColor("green");
	}

	unselect(){
		super.unselect();
		this.reinitializeColor();
	}
}