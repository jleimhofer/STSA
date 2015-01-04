jQuery.sap.require("STSA.util.Formatter");
jQuery.sap.require("STSA.util.Controller");

STSA.util.Controller.extend("STSA.view.Detail", {

	onInit : function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if(sap.ui.Device.system.phone) {
			//don't wait for the master on a phone
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			this.getView().setBusy(true);
			this.getEventBus().subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
	},

	onMasterLoaded :  function (sChannel, sEvent, oData) {
		if(oData.oListItem){
			this.bindView(oData.oListItem.getBindingContext().getPath());
			this.getView().setBusy(false);
			this.oInitialLoadFinishedDeferred.resolve();
		}
	},

	onRouteMatched : function(oEvent) {
		var oParameters = oEvent.getParameters();

		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function () {

			// when detail navigation occurs, update the binding context
			if (oParameters.name !== "detail") { 
				return;
			}

			var sEntityPath = "/" + oParameters.arguments.entity;
			this.bindView(sEntityPath);

		}, this));
	},

	bindView : function (sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if(!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified actually was found.
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = oView.getModel().getData(sEntityPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				} else {
					this.fireDetailChanged(sEntityPath);
				}
			}, this));

		} else {
			this.fireDetailChanged(sEntityPath);
		}

	},

	showEmptyView : function () {
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "STSA.view.NotFound",
			targetViewType : "XML"
		});
	},

	fireDetailChanged : function (sEntityPath) {
		this.getEventBus().publish("Detail", "Changed", { sEntityPath : sEntityPath });
		
		var filters = [];
		// filter by current ticket
		var ticketId = this.getView().getModel().getProperty(sEntityPath + "/TicketId");
        filters.push(new sap.ui.model.Filter("TicketId", sap.ui.model.FilterOperator.EQ, ticketId));
		// update list binding
		this.getView().byId("commentList").getBinding("items").filter(filters);

	},

	fireDetailNotFound : function () {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack : function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	},
	
	onSelect : function(oEvent) {
		// Get the list item, either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode).
		// this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
	},
	
	onAddComment    : function() {
	    // fill new record
        var bindingContext = this.getView().getBindingContext();
		var ticketId = bindingContext.getProperty("TicketId");
        var content = this.getView().byId("newComment").getValue();
	    var oEntry = {};
        oEntry.CommentId = 0;
        oEntry.Content = content;
        oEntry.TicketId = ticketId;
        oEntry.Deleted = 0;
        oEntry.Mandt = "200";

        // create new record        
        var oModel = this.getView().getModel();
        jQuery.sap.require("sap.ui.commons.MessageBox");
        oModel.create("/CommentSet", oEntry, null, function(){
            sap.ui.commons.MessageBox.alert("Comment successfully created!");
        },function(){
            sap.ui.commons.MessageBox.alert("Error occured!");
        });
        
        this.getView().byId("newComment").setValue("");
        this.getView().byId("newComment").setPlaceholder("New Comment ...");
	}
});
