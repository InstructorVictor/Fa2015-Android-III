(function () {
    "use strict";

	document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

	function onDeviceReady() {
		
		document.addEventListener( 'pause', onPause.bind( this ), false );
		document.addEventListener( 'resume', onResume.bind( this ), false );
		
		function onPause() {
			// TODO: This application has been suspended. Save application state here.
		};

		function onResume() {
			// TODO: This application has been reactivated. Restore application state here.
		};
		
		var androidVer = device.version;
		var androidVerInt = parseInt(androidVer, 10);
		if(androidVerInt >= 4) {
			console.log("Android version: " + androidVer);
			console.log("PouchDB IS available");
			$("#shareClasses").hide();
		} else {
			console.log("PouchDB is NOT available");
			$("#myClassesBtn").hide();
		}
		
		navigator.splashscreen.hide();

		// Ask for a user's name, save it to a localStorage object, then display it on-screen in a <span> placeholder with a Class
		$("#btnGetName").on("click", function() { getName() });
		function getName() {
			localStorage.userName = prompt("What's your name?");
			if((localStorage.userName == 'null') || (localStorage.userName == undefined) || (localStorage.userName == "")) {
				// Nothing
				console.log("Invalid name");
			} else {
				$(".welcomeMessage").html(", " + localStorage.userName + "!");
			}
		}

		// Runs when project loads; checks to see if a username has been input or not; if so, display on-screen
		function loadName() {
			if((localStorage.userName == 'null') || (localStorage.userName == undefined) || (localStorage.userName == "")) {
				// Do nothing; no name has been input
				console.log("No name, yet");
			} else {
				$(".welcomeMessage").html(", " + localStorage.userName + "!");
			}
		}
		
		$('.btnGetURL').on('click', function() { goToURL($(this)) });
		function goToURL(url) {
			cordova.InAppBrowser.open(url.data("url"), "_blank", "location=yes")
		}
		
		var db = new PouchDB("sdceClasses");
				
		db.info(function callback(error, result) { 
				db.changes({
					since: result.update_seq,
					live: true
				}).on("change", showClasses);
			}
		);

		$("#addClasses").click(function () { addClasses() });
		function addClasses() {
			var classCRN = document.getElementById("crnField").value;
			var classTitle = document.getElementById("titleField").value;
			var classInstructor = document.getElementById("instructorField").value;

			var aClass = { 
				_id: classCRN,
				title: classTitle,
				inst: classInstructor
			};
			console.log(aClass);
			db.put(aClass, 
				function callback(error, result) {
					if(!error) {
						document.getElementById("theResult").innerHTML = "Class added!";
						clearFields();
					} else {
						navigator.notification.alert(
							'Please enter all fields',
							function(result) { console.log(result) },
							'Error'
						);
					}
				}
			);
		} // End of addClasses() function!
				
		function clearFields() {
			document.getElementById("classForm").reset();
		}
		
		$("#showClasses").click(function () { showClasses() });
		function showClasses() {
			db.allDocs({include_docs: true, ascending: true},
				function callback(error, result) {
					showTableOfClasses(result.rows);
				}
			);
			// $("#shareClasses").show(); // To-do: Share classes via jsPDF
		} // End of showClasses() function
				
		function showTableOfClasses(data) {
			var div = document.getElementById("theResult");
			var str = "<table border='1' id='classTable'><tr><th>CRN</th><th>Class</th><th>Instructor</th></tr>";
			for(var i = 0; i < data.length; i++) {
				str += "<tr><td>" + data[i].doc._id +
				"</td><td>" + data[i].doc.title + 
				"</td><td>" + data[i].doc.inst +
				"</td></tr>";
			};
			str += "</table>";
			str += "<hr>";
			str += "<input type='text' placeholder='123' id='deleteCRN'><button id='deleteClasses'>Delete CRN</button>";
			str += "<hr>";
			str += "<br style='clear: both;'><div class='divTwoCol'><div class='leftCol'><button id='updateClass'>Update Class</button></div><div class='rightCol'><input type='text' placeholder='CRN' id='updateCRN'><input type='text' placeholder='Class Title' id='updateTitle'><input type='text' placeholder='Instructor' id='updateInst'></div></div>";
			div.innerHTML = str;
		} // End of showTableOfClasses() function

		$("#theResult").on("click", "tr", function() { deleteClassesPrep($(this)) });
		function deleteClassesPrep(thisObj) {
			var $editCRN = thisObj.find("td:eq(0)").text();
			var $editTitle = thisObj.find("td:eq(1)").text();
			var $editInst = thisObj.find("td:eq(2)").text();

			$("#updateCRN").val($editCRN);
			$("#updateTitle").val($editTitle);
			$("#updateInst").val($editInst);
		}
		
		$("body").on("click", "#deleteClasses", function () { deleteClasses() });
		function deleteClasses() {
			var theClass = document.getElementById("deleteCRN").value;
			db.get(theClass, function callback(error, result) {
					db.remove(result, function callback(error, result) {
							if(result) {
								document.getElementById("deleteCRN").value = "";
								showClasses();
							} else {
								document.getElementById("deleteCRN").value = "";
								alert("The class CRN" + theClass + " does not exist. Try again!");
								console.log(error);
							}
						}
					);
				}
			);
		} // End of deleteClasses() function

		$("body").on("click", "#updateClass", function () { updateClass() });
		function updateClass() {
			var theCRN 		= document.getElementById("updateCRN").value;
			var theTitle	= document.getElementById("updateTitle").value;
			var theInst		= document.getElementById("updateInst").value;
			db.get(theCRN, function callback(error, result) {
					if(error) {
						document.getElementById("updateCRN").value = "";
						document.getElementById("updateTitle").value = "";
						document.getElementById("updateInst").value = "";
						alert("The class CRN" + theCRN + " does not exist. Try again!");
						console.log(error);
					} else {
						db.put({
							_id: theCRN,
							_rev: result._rev,
							title: theTitle,
							inst: theInst
						}, function callback(error, result){
							if(error){ console.log(error); }
						});
					}
				}
			);
		} // End of updateClass() function

		$("#btnEmailUs").on('click', function() { emailUs() });
		function emailUs() {
			window.plugins.socialsharing.shareViaEmail(
				  'A comment about your app:<br>', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
				  'mySDCE App Feedback',
				  ['victor@pmdinteractive.com'], // TO: must be null or an array
				  null, // CC: must be null or an array
				  null, // BCC: must be null or an array
				  null, // FILES: can be null, a string, or an array
				  function(result) { console.log('result: ' + result) }, // called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
				  function(error) { console.log('error: ' + error) } // called when sh*t hits the fan
			);
		}

		$("#btnShareApp").on('click', function() { shareApp() });
		function shareApp() {
			window.plugins.socialsharing.share(
				'Check out the mySDCE App!',		 					// Message
				'mySDCE App Download',									// Subject
				['www/images/sdce-logo-main.png'],				 		// Image
				'https://play.google.com/store/apps/details?id=com.pmdinteractive.mysdce',	// Link
				function(result) { console.log('result: ' + result) },	// called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
				function(error) { console.log('error: ' + error) } 		// called when sh*t hits the fan
			);
		}
		
		// To-do: Share classes via email
		// Maybe jsPDF? http://www.tricedesigns.com/2014/01/08/generating-pdf-inside-of-phonegap-apps/ 
		// MAYBE: http://stackoverflow.com/questions/16858954/how-to-properly-use-jspdf-library
		/* 
		$("#btnShareClasses").on('click', function() { shareClasses() });
		function shareClasses() {
			var div = document.getElementById("theResult");
			console.log(div);
			window.plugins.socialsharing.share(
				div,
				'Check out my classes!',
				null,
				null,
				function(result) { console.log('result: ' + result) },
				function(error) { console.log('error: ' + error) }
			);
		}
		*/
		
		loadName();
	}
} )();

/*
	Name: 		Victor Campos <victor@pmdinteractive.com>
	Project:	mySDCE
	Desc:		Proof of concept app: Cordova/Taco/PhoneGap + jQuery Mobile + PouchDB + Social Sharing Plugin
	Date:		2016-02-15
	Version:	1.0.20160215
*/