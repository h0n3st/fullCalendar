
class Calendar{
	constructor(selector){
		this.selector = selector;
		this.ressources = [];
		this.disponibilities = [];
		this.events = [];
		this.views = [];
		this.defaultView = null;
	}
	print(){

		var JSONressources = [];
		for (var i = 0 ; i < this.ressources.length;i++){
			JSONressources.push(this.ressources[i].toJSON());
		}

		var JSONevents = [];
		for(var i = 0 ; i < this.events.length;i++){
			JSONevents.push(this.events[i].toJSON());
		}
		for(var i = 0 ; i < this.disponibilities.length;i++){
			JSONevents.push(this.disponibilities[i].toJSON());
		}

		$(this.selector).fullCalendar({
	    	schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
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
	    	ressources:JSONressources,
	    	events:JSONevents
	        // put your options and callbacks here
	    })
	}

	addView(view){
		this.views.push(view);
		if(this.defaultView == null){
			this.setDefaultView(view);
		}
	}

	setDefaultView(view){
		this.defaultView = view;
	}

	getViewsList(){
		var list = "";
		if(this.views.length >= 1){
			list += this.views[0];
		}
		for(var i = 1 ; i < this.views.length;i++){
			list+= "," + this.views[i];
		}
		return list;
	}

	getDefaultView(){
		return this.defaultView;
	}
	addRessource(ressource){

		this.ressources.push(ressource);
	}

	addEventDisponibility(eventDisponibility){

		this.disponibilities.push(eventDisponibility);
	}

	addEvent(event){

		this.events.push(event);
	}

	isRessourceFree(ressourceId, start, end){
		for(var i = 0 ; i < this.disponibilities ; i++){
			var disponibility = this.disponibilities[i];
			

		}
	}
	
}

function createRessource(id, title){
	return new Ressource(id,title);
}

function createEvent(id, title, start, end){
	return new AbstractEvent(id, title, start, end);
}

class Ressource{
	constructor(id, title){
		this.id = id;
		this.title = title;
	}

	toJSON(){
		return {"id":this.id,"title":this.title};
	}
}

class AbstractEvent{
	constructor(id, title, start, end){
		this.id = id;
		this.title = title;
		this.start = start;//new Date(start);
		this.end = end;//new Date(end);
		this.ressources = [];
	}
	toJSON(){
		return {
			"id":this.id,
			"title":this.title,
			"start":this.start,
			"end":this.end
		}
	}
	getStartTime(){
		return this.start; //tmp
	}
	getEndTime(){
		return this.end //tmp
	}
	addRessource(ressourceId){
		this.ressources.push(ressourceId);
	}
}

/*
We need to have 2 views :
	The client view
		Here we simply need to show available ressources for the client research

	The clinic view



*/

