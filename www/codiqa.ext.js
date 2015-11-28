document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	navigator.splashscreen.hide();
	
		var db = new PouchDB("sdceClasses");
			db.info().then(function (info) { console.log(info);	});
			function clearFields() {
				$("#classForm")[0].reset();
			}
			function addClass() {
				var $classCRN = $("#crnField").val();
				var $classTitle = $("#titleField").val();
				var $classInstructor = $("#instructorField").val();
				console.log($classCRN);
				console.log($classTitle);
				console.log($classInstructor);
				var aClass = {
					"_id" : $classCRN,
					"title" : $classTitle,
					"inst" : $classInstructor
				};
				db.put(aClass, function(error, result) { 
						if(result) {
							// alert(result.rev);
							console.log(result);
							clearFields();
							$("#theResult").text("Class added!");
						} else {
							// alert(error.message);
							clearFields();
							switch(error.status) {
								case 409:
									console.log(error.message);
									$("#theResult").text("That CRN already exists");
									break;
								case 412:
									console.log(error.message);
									$("#theResult").text("Please fill out all fields");
									break;
								case 500:
									console.log(error.reason);
									$("#theResult").text("Failed to open indexedDB, are you in private browsing mode?");
									break;
								default:
									console.log(error.message);
									$("#theResult").text(error);
							}
						}
					}
				);
			}
			function showClasses() {
				db.allDocs({"include_docs" : true, "ascending" : true},
				function(error, result) { showTableOfClasses(result.rows)});
			}
			function showTableOfClasses(data) {
				var $div = $("#theResult");
				// var str = data[0].doc._id;
				var str = "<table border='1' id='classTable'><tr><th>CRN</th><th>Title</th><th>Instructor</th><th>&nbsp;</th></tr>";
				for(var i = 0; i < data.length; i++) {
					str += "<tr><td>" + data[i].doc._id +
					"</td><td>" + data[i].doc.title +
					"</td><td>" + data[i].doc.inst +
					"</td><td>" + "<a href='#' class='btnEdit ui-btn ui-mini ui-icon-edit ui-btn-icon-notext ui-corner-all'>Edit</a>" +
					"</td></tr>";
				}
				str += "</table>";
				str += "<hr><input type='text' placeholder='123' id='deleteCRN'><button id='deleteClass'>Delete CRN</button>";
				str += "<hr><button id='updateClass'>Update Class</button><input type='text' placeholder='123' id='updateCRN'><input type='text' placeholder='Title' id='updateTitle'><input type='text' placeholder='Instructor' id='updateInstructor'>";
				$div.html(str);
			}
			function deleteClass() {
				// alert("We are about to delete a class");
				var $theClass = $("#deleteCRN").val();
				console.log($theClass);
				db.get($theClass, function(error, result) {
					db.remove(result, function(error, result) {
						if(result) {
							showClasses();
							console.log(result);
							$("#deleteCRN").val("");
						} else {
							alert("The class CRN" + $theClass + " is not found!");
							console.log(error);
							$("#deleteCRN").val("");
						}
					});
				});
			}
			function updateClass() {
				var $theCRN = $("#updateCRN").val(),
					$theTitle = $("#updateTitle").val(),
					$theInstructor = $("#updateInstructor").val();
				console.log($theCRN, $theTitle, $theInstructor);
				db.get($theCRN, function(error, result) {
						if(error) {
							$("#updateCRN").val("");
							$("#updateTitle").val("");
							$("#updateInstructor").val("");
							console.log(error);
							alert("The class CRN" + $theCRN + " does not exist!");
						} else {
							db.put({
								"_id" : $theCRN,
								"title" : $theTitle,
								"inst" : $theInstructor,
								"_rev" : result._rev
							}, function(error, result){
								if(error) {
									console.log(error);
									alert(error);
								} else {
									showClasses();
									console.log(result);
								}
							});
						}
					}
				);
			}
			function updateClassPopulate(thisObj) {
				var $oldCRN = thisObj.find("td:eq(0)").text(),
					$oldTitle = thisObj.find("td:eq(1)").text(),
					$oldInst = thisObj.find("td:eq(2)").text();
					console.log($oldCRN, $oldTitle, $oldInst);
				$("#updateCRN").val($oldCRN);
				$("#updateTitle").val($oldTitle);
				$("#updateInstructor").val($oldInst);
			}
			$("#addClass").on("click", function() { addClass() });
			$("#showClasses").on("click", function() { showClasses() });
			$("#theResult").on("click", "#deleteClass", function() { deleteClass() });
			$("#theResult").on("click", "#updateClass", function() { updateClass() });
			$("#theResult").on("click", "tr", function() { updateClassPopulate($(this)) });
}

function getURL(theURL) {
	window.open(theURL, "_blank", "location=yes");
}

function getName() {
	navigator.notification.prompt(
		'Please enter your name',  // message
		onPrompt,                  // callback to invoke
		'Customize',	           // title
		['Cancel','OK'],           // buttonLabels
		'Jane'		               // defaultText
	);
}

function onPrompt(results) {
	if(results.buttonIndex == 2) {
		localStorage.userName = results.input1;
		$(".nameMsg").html(", " + localStorage.userName + "!");	
	} else {
		$(".nameMsg").html("");	
	}
}

function loadName() {
	if(localStorage.userName == undefined) {
		// No name. Do nothing.
	} else {
		$(".nameMsg").html(", " + localStorage.userName + "!");
	}
}

$("#btnCustomize").on("click", function() { getName() });

/* 
	Developer Name:		Victor Campos <vcampos@sdce.edu>
	Project Name:			mySDCE
	Project Version:			1.20151119
	Date:						2015-11-19
*/