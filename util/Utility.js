jQuery.sap.declare("util.Utility");


function search(oView, newValue, listId) {
    var filterPattern = newValue.toLowerCase(), oList = oView.byId(listId), 
    listItems = oList.getItems(), i, item, visibility;

    for (i = 0; i < listItems.length; i++) {
    	item = listItems[i];
    	visibility = false;
        if (item.getTitle().toLowerCase().indexOf(filterPattern) !== -1) {
    		visibility = true;
        }
        if (item.getNumber().toString().indexOf(filterPattern) !== -1) {
    		visibility = true;
        }
        if (item.getNumberUnit().toLowerCase().toString().indexOf(filterPattern) !== -1) {
    		visibility = true;
        }
    	listItems[i].setVisible(visibility);
    }
}

function openLoginDialog(router, model, view, component) {
    	
    	sap.ui.commons.Dialog.prototype.onsapescape = function(){ };  
    	var loginView = sap.ui.view({
			type:sap.ui.core.mvc.ViewType.XML, 
			viewName:"STSA.view.Login"
		});

        loginView.setModel(model);		
        
		var oLoginDialog = new sap.m.Dialog({
			modal : true,
			content : [ loginView ],
			title: "Technician"
		});
        sap.ui.getCore().AppContext.LoginDialog = oLoginDialog;
		
		oLoginDialog.setContentWidth("100%");
        oLoginDialog.setContentHeight("100%");
        oLoginDialog.attachAfterClose(function(oEvent)  {
            if(sap.ui.getCore().AppContext.ValidUser)
            {
                // start application if user is valid
    		    router.initialize();
    		    if(component === 0)
    		    {
	            	var filters = [];
            		// filter by technician
                    filters.push(new sap.ui.model.Filter("TechnicianId", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().AppContext.TechnicianId));
            		// update list binding
            		view.byId("list").getBinding("items").filter(filters);
    		    }
            }
            else
            {
                // reopen dialog as long as login is not successful
                oLoginDialog.open();
            }
        });
        
		oLoginDialog.open();
}