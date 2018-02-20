
class Calendar{
	constructor(selector){
		this.selector = selector;
		this.events = [];
		this.views = [];
		this.defaultView = null;
		this.builder = null;
		this.printed = false;
	}
	print(jsonData){

		if(!this.printed){
            var selector = this.selector;
            var calendar = this;
            var builder = this.builder;

            jsonData.editable = true;
            jsonData.selectable = true;
            jsonData.events = this.events;

            jsonData.viewRender = function() {calendar.reprint();}

            jsonData.select = function(start, end){

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
                    }
                }
                calendar.rerenderEvents();
            };

            jsonData.eventClick = function(event, jsEvent, view){
                var data = {event:event, jsEvent:jsEvent, view:view};
                calendar.getEvent(event.id).manageAction("click",event, data);
                calendar.rerenderEvents();
            };

            jsonData.eventDrop = function( event, delta, revertFunc, jsEvent, ui, view ){
                var data = {event:event, delta:delta, revertFunc:revertFunc, jsEvent:jsEvent, ui:ui, view:view};
                calendar.getEvent(event.id).manageAction("drag",event, data);
                calendar.rerenderEvents();
            };

            jsonData.eventResize = function( event, delta, revertFunc, jsEvent, ui, view ) {
                var data = {event:event, delta:delta, revertFunc:revertFunc, jsEvent:jsEvent, ui:ui, view:view};
                calendar.getEvent(event.id).manageAction("resize",event,data);
                calendar.rerenderEvents();
            };

            $(selector).fullCalendar(jsonData);
            this.printed = true;
		}
		else{
			this.reprint();
		}
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
			}
		}
	}

	addEvent(event){
		this.events.push(event);
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

	rerenderEvents(){
		var eventsToRender = [];
		for(var i = 0 ; i < this.events.length; i++){
			if(this.events[i].toRender()){
				eventsToRender.push(this.events[i]);
			}
		}

		for(var i = 0 ; i < eventsToRender.length; i++){
			$(this.selector).fullCalendar("removeEvents", eventsToRender[i].id);
		}
        $(this.selector).fullCalendar("renderEvents", eventsToRender);

		for(var i = 0 ; i < eventsToRender.length; i++){
			eventsToRender[i].setRendered();
		}
	}

	//Fully reprint events, shouldn't be used
	reprint(){
		for(var i = 0 ; i < this.events.length; i++){
			this.events[i].setModified();
		}
		this.rerenderEvents();
	}
}

class BaseEventBuilder{
	constructor(calendar){
		this.calendar = calendar;
	}
	createEvent(id,title,start,end){
		var event = this.instantiateEvent();
        this.fillEvent(event, id, title, start, end);
		return event;
	}

	instantiateEvent(){
		return new BaseEvent(this.calendar);
	}

	fillEvent(event,id,title,start,end){
		event.setId(id);
		event.setTitle(title);
		event.setStart(start);
		event.setEnd(end);
	}
}

class EditableEventBuilder extends BaseEventBuilder{

	instantiateEvent(){
		return new EditableEvent(this.calendar);
	}

	fillEvent(event, id, title, start, end){
		super.fillEvent(event,id,title,start,end);
		event.setColor("blue");
		event.setEditable();
	}
}

class AbstractEvent{
	constructor(calendar){
		this.calendar = calendar;
		this.ressources = [];
		this.editable = false;
	}
	addRessource(ressourceId){
		this.ressources.push(ressourceId);
	}
	setId(id)			{ this.setProperty("id", id);			}
	setTitle(title)		{ this.setProperty("title", title);		}
	setStart(start)		{ this.setProperty("start", start);		}
	setEnd(end)			{ this.setProperty("end", end);			}
	setEditable()		{ this.setProperty("editable", true);	}
	setColor(color){
		this.setProperty("color", color);
		if(this.initialColor == undefined){
			this.setProperty("initialColor", color);
		}
	}
	setProperty(key, value){
		this[key] = value;
	}
	isInitialColor() {
		return this.color == this.initialColor;
	}
	reinitializeColor() {
		this.color = this.initialColor;
	}
	pullDataFrom(jsonEvent){
		for(var key in jsonEvent){
			this[key] = jsonEvent[key];
		}
	}
}

class RenderableEvent extends AbstractEvent{
	constructor(calendar){
		super(calendar);
		this.modified = true;
	}
	setProperty(key,value){
		if(this[key] != value){
			this.setModified();
		}
		super.setProperty(key,value);
	}
	setModified(){
		this.modified = true;
	}
	toRender(){
		return this.modified;
	}
	setRendered(){
		this.modified = false;
	}
}

class ActionnableEvent extends RenderableEvent{

	manageAction(actionCode, event){
		this.manageAction(actionCode, event, {});
	}

	manageAction(actionCode, event, data){

		this.pullDataFrom(event);

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
		}
	}

	onEventDrag(event, data){}
	onEventResize(event, data){}
	onEventClick(event, data){}
}

class selectableEvent extends ActionnableEvent{
	constructor(calendar) {super(calendar); this.selected = false;}

	select(){this.setProperty("selected", true);}
	unselect(){this.setProperty("selected", false);}

	isSelected() {return this.selected;}
}

class revertableEvent extends selectableEvent{
	manageAction(actionCode, event, data){
		this.saveData();
		super.manageAction(actionCode,event,data);
		this.clearSavedData();
	}

	saveData(){
		var initialData = {};
		for(var key in this){
			initialData[key] = this[key];
		}

		this.initialData = initialData;
	}

	clearSavedData(){
		this.initialData = undefined;
	}
	revert(){
		this.pullDataFrom(this.initialData);
		this.setModified();
	}
}

class BaseEvent extends revertableEvent{
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
		if(!this.isSelected()){
			this.revert();
			this.setColor("red");
		}
		
	}
	onEventResize(event, data){
		if(!this.isSelected()){
			this.revert();
			this.setColor("red");
		}
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