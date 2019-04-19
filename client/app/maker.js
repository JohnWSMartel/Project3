const loadDomosFromServer = () => {
    //Get the token, once that is done get the domos
    sendAjax('GET', '/getToken', null, (tokenData) => {
        sendAjax('GET', '/getDomos', null, (data) =>{
	   	   ReactDOM.render(
               //Added the csrf token for the very first time we call DomoList
	   		  <DomoList domos = {data.domos} csrf={tokenData.csrfToken}/>, document.querySelector("#domos")
	   	   );
	   }); 
    });
};

const handleDomo = (e) => {
	e.preventDefault();
	
	$("#domoMessage").animate({width:'hide'},350);
	
	if($("#domoName").val() == ''||$("#domoAge").val() == ''){
		handleError("RAWR! All fields are required");
		return false;
	}
	
	sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
		loadDomosFromServer();
	});
	
	return false;
};

const removeDomo = (e) => {
    //Refactored remove domo to properly work with how it is being used. It now takes in an
    //event object. That object represents the specific domo form we are trying to delete.
	e.preventDefault();
    
	$("#domoMessage").animate({width: 'hide'},350);
    
    //We can get the id and csrf token from the form and construct our form data from that.
    const domoId = e.target.querySelector('#_id').defaultValue;
    const domoCsrf = e.target.querySelector('#csrf').defaultValue;
    const formData = `_id=${domoId}&_csrf=${domoCsrf}`;
    
    //We can construct a request by getting the method (post) and the action (/deleteDomo)
    //out of the form in the event (e) object.
    const xhr = new XMLHttpRequest();
    xhr.open(e.target.method, e.target.action);
    
    //Setup our headers
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader ('Accept', 'application/json');
    
    //Send the request, and get all the domos from the server so the page refreshes
    xhr.send(formData);
    loadDomosFromServer();
	
	return false;
};

const fight = (e) => {
  e.preventDefault();
  
  const f1Name = e.target.querySelector("#fighter1Name").value;
  const f2Name = e.target.querySelector("#fighter2Name").value;
  const formId = e.target.querySelector("#_csrf").value;
  const formData = `name1=${f1Name}&name2=${f2Name}&_csrf=${formId}`;
  
  
  //send the above to the server and finish fight there
  //post request
	//We can construct a request by getting the method (post) and the action (/deleteDomo)
  //out of the form in the event (e) object.
  const xhr = new XMLHttpRequest();
  xhr.open(e.target.method, e.target.action);
  
  //Setup our headers
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader ('Accept', 'application/json');
  
  //Send the request, and get all the domos from the server so the page refreshes
  xhr.send(formData);
  loadDomosFromServer();
  
  
  return false;
};

const DomoForm = (props) => {
	return (
		<form id="domoForm"
			onSubmit={handleDomo}
			name="domoForm"
			action="/maker"
			method="POST"
			className="domoForm"
		>
			<label htmlFor="name">Name: </label>
			<input id="domoName" type="text" name="name" placeholder="Fighter Name" />
			<label htmlFor="age">Age: </label>
			<input id="domoAge" type="text" name="age" placeholder="Fighter Age" />
            <label htmlFor="level">Level: </label>
            <input id="domoLevel" type="text" name="level" placeholder="Fighter Level" />
			<input type="hidden" name="_csrf" value={props.csrf} />
			<input className="makeDomoSubmit" type="submit" value="Make Fighter" />
		</form>
	);
};

const DomoList = function(props) {
	if(props.domos.length === 0){
		return (
			<div className = "domoList">
				<h3 className="emptyDomo">No Fighters yet</h3>
			</div>
		);
	}
    
	const domoNodes = props.domos.map(function(domo) {
        //Added in the domo._id value, and the props.csrf value
      return (
          <form id="domoList"
            onSubmit={removeDomo}
            name="domoList"
            action="/deleteDomo"
            method="POST"
            className="domoList"
          >
			<div key={domo._id} className="domo">
				<img src="/assets/img/domoface.jpeg" alt="Fighter face" className="domoFace" />
				<h3 className="domoName"> Name: {domo.name} </h3>
				<h3 className="domoAge"> Age: {domo.age} </h3>
                <h3 className="domoLevel"> Level: {domo.level} </h3>
                <input id="_id" type="hidden" name="_id" value={domo._id} />
				<input id="csrf" type="hidden" name="_csrf" value={props.csrf} />
                <input type="submit" value="Kill Fighter" />
			</div>
          </form>
		);
	});
	
	return (
		<div className="domoList">
		{domoNodes}
		</div>
	);
};

const Arena = function(props){
  return(
    <form id="arena"
      onSubmit={fight}
      name="arena"
      action="/doFight"
      method="POST"
      className="arena"
    >
      <label htmlFor="fighter1">First Fighter: </label>
      <input id="fighter1Name" type="text" name="name1" placeholder="Fighter 1" />
      <label htmlFor="fighter2">Second Fighter: </label>
      <input id="fighter2Name" type="text" name="name2" placeholder="Fighter 2" />
      <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
      <input className="makeFightHappen" type="submit" value="FIGHT!" />
    </form> 
  );
};

const setup = function(csrf){
	ReactDOM.render(
		<DomoForm csrf={csrf} />, document.querySelector("#makeDomo")
	);
	
    // When we render the page, we need to add csrf={csrf} to add the token to the props object
	ReactDOM.render(
		<DomoList domos={[]} csrf={csrf} />, document.querySelector("#domos")
	);
  
    ReactDOM.render(
        <Arena csrf={csrf} />, document.querySelector("#arena")
    );
	
	loadDomosFromServer();
};

const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

$(document).ready(function(){
	getToken();
});