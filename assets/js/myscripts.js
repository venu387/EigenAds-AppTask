/*
*   Created by: Venu Srinivasa Reddy
*   Date:  March 11th 2017
*   File name: custom.js
*   Description: This file contains the javascripts methods and event handlers used in the app.
*/

//Global variables
var map;
var infoWindow;
var listOfPolygons = [] /* An array to hold the regions' co-ordinates */

$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDLn_NOCXSeQNkFP60yjd6T0l2puITtt-U",
        authDomain: "application-task-4e8fe.firebaseapp.com",
        databaseURL: "https://application-task-4e8fe.firebaseio.com",
        storageBucket: "application-task-4e8fe.appspot.com",
        messagingSenderId: "642350060913"
    };
    firebase.initializeApp(config);
    google.maps.event.addDomListener(window, 'load', initializeMap); /* Hander for window.load */

    initFirebase();

    $(".draggable").draggable({ handle: "div" });

    /* Form validators */
    //Login Form validation
    $('#signinform').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            email: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your email address'
                    },
                    emailAddress: {
                        message: 'Please supply a valid email address'
                    }
                }
            },

            password: {
                validators: {
                    notEmpty: {
                        message: 'Please supply a password'
                    },
                    stringLength: {
                        min: 6,
                        max: 32,
                        message: 'Password must have min 6 characters'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {
    });

    //Sign up form validation
    $('#signupform').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            fsname: {
                validators: {
                    stringLength: {
                        min: 2,
                    },
                    notEmpty: {
                        message: 'Please supply your first name'
                    }
                }
            },
            lsname: {
                validators: {
                    stringLength: {
                        min: 2,
                    },
                    notEmpty: {
                        message: 'Please supply your last name'
                    }
                }
            },

            email: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your email address'
                    },
                    emailAddress: {
                        message: 'Please supply a valid email address'
                    }
                }
            },

            password: {
                validators: {
                    notEmpty: {
                        message: 'Please supply a password'
                    },
                    stringLength: {
                        min: 6,
                        max: 32,
                        message: 'Password must have min 6 characters'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {
    });
    /* Form validators end */
});


/*
    Logout event handler
    Clear the user session and reload the page
*/
$('.btnlogout').click(function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        localStorage.removeItem('firebase:authUser:AIzaSyDLn_NOCXSeQNkFP60yjd6T0l2puITtt-U:[DEFAULT]');  /* Remove the localstorage firebase data */
        window.location.href = 'index.html';

    }).catch(function (error) {
        // An error happened.
        $('.errout').html('<div class="alert alert-danger"><strong>Fail!</strong> ' + error.message + '</div>');
        $('.errout').slideDown(500).delay(10000).slideUp(500);
    });
});

//Show regions toggle event handler
$('#myonoffswitch').click(function () {
    if (this.checked) {
        //Diaplay the regions on google maps
        displayRegions();
    }
    else {
        //Hide all the regions on the map
        removeRegions();
    }
});

/*
    Signin form click handler
    User authentication using email and password given
*/
$('.btnlogin').click(function (event) {

    var validator = $('#signinform').data('bootstrapValidator');
    validator.validate();
    if (validator.isValid()) {

        //alert('valid');

        var email = $('#c-form-1-email').val();
        var password = $('#c-form-1-password').val();

        var response = firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {

            $('.errsi').html('<div class="alert alert-success"><strong>Success!</strong>Login Successful</div>').show();
            $('.errsi').slideDown(500).delay(1000).hide();

            printShowUserNameSession();
        }, function (error) {
            //console.log(error);

            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            $('.errsi').html('<div class="alert alert-danger"><strong>Login Fail!</strong> ' + errorMessage + '</div>');
            $('.errsi').slideDown(500).delay(10000).slideUp(500);
        });
    }
    else {
        //Form validation failed
    }
});

//Singup user. //Create user and login
$('.btnsignup').click(function (event) {

    var validator = $('#signupform').data('bootstrapValidator');
    validator.validate();
    if (validator.isValid()) {
        //alert($('#c-form-1-fname').val() + '' + $('#c-form-1-lname').val() + '' + $('#c-form-1-semail').val() + '' + $('#c-form-1-spassword').val());

        var fname = $('#c-form-1-fname').val();
        var lname = $('#c-form-1-lname').val();
        var email = $('#c-form-1-semail').val();
        var password = $('#c-form-1-spassword').val();

        firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {

            $('.errsu').html('<div class="alert alert-success"><strong>Success!</strong> User created successfully </div>');
            $('.errsu').slideDown(500).delay(1000).hide();

            //Store the name in firebase db
            writeUserData(fname, lname);

            printShowUserNameSession();

        }, function (error) {
            //console.log(error);

            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            $('.errsu').html('<div class="alert alert-danger"><strong>Fail!</strong> ' + errorMessage + '</div>');
            $('.errsu').slideDown(500).delay(10000).slideUp(500);
        });
    }
    else {

    }
});

//Minimize button handler
$('.btnmin').click(function () {
    $(this).toggleClass('fa-chevron-circle-down');
    $(this).toggleClass('fa-chevron-circle-up');

    $(this).next('div').slideToggle();
});

//Initialize the google map
/*
    Set the center of map
    Change style
*/
function initializeMap() {

    var initialLocation = new google.maps.LatLng(42.3043, -83.064054);
    var styles;

    var date = new Date() //get hours of the day in 24Hr format (0-23)

    var hr = date.getHours();

    //Custom Styles for maps

    console.log(hr);
    //Night mode
    if (hr < 5 || hr > 18)
        styles = [{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }, { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] }, { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] }, { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] }, { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] }, { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] }, { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] }, { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }];

        //Muted Blue
        //styles = [{"featureType":"all","stylers":[{"saturation":0},{"hue":"#e7ecf0"}]},{"featureType":"road","stylers":[{"saturation":-70}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"visibility":"simplified"},{"saturation":-60}]}]

        //Caltex V4
    else
        styles = [{ "featureType": "all", "elementType": "geometry", "stylers": [{ "hue": "#ff4400" }, { "saturation": -68 }, { "lightness": -4 }, { "gamma": 0.72 }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#999999" }, { "lightness": "-60" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#cccccc" }] }, { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "hue": "#0077ff" }, { "gamma": 3.1 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "lightness": "60" }] }, { "featureType": "poi.park", "elementType": "all", "stylers": [{ "saturation": -23 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#cccccc" }, { "lightness": "0" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#cccccc" }, { "lightness": "-25" }] }, { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "saturation": -64 }, { "lightness": 16 }, { "gamma": "2.15" }, { "weight": 2.7 }, { "color": "#ffffff" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "lightness": "-60" }, { "gamma": "1.20" }, { "hue": "#00ffff" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "hue": "#00ccff" }, { "gamma": 0.44 }, { "saturation": -33 }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "hue": "#007fff" }, { "gamma": 0.77 }, { "saturation": 65 }, { "lightness": 99 }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "weight": 5.6 }, { "hue": "#0091ff" }, { "saturation": "100" }, { "gamma": "120" }, { "lightness": "-70" }] }];

    //energaz
    //styles = [{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"simplified"},{"color":"#db2605"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"on"},{"gamma":"0.50"},{"hue":"#0085ff"},{"lightness":"-79"},{"saturation":"-86"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#ff2700"}]},{"featureType":"landscape.natural.landcover","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#ff0000"}]},{"featureType":"poi","elementType":"all","stylers":[{"color":"#ff0000"},{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#424e59"},{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"color":"#424e59"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"color":"#424e59"}]},{"featureType":"road","elementType":"all","stylers":[{"color":"#424e59"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#c0cbd5"},{"visibility":"on"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#313639"},{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text","stylers":[{"hue":"#ff0000"},{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"hue":"#ff0000"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#597289"}]}];

    //blues-and-greys
    //styles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative.locality","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#91a7ac"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#91a7ac"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#0095ff"},{"saturation":"-78"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"color":"#343231"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#343231"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway.controlled_access","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#343231"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#343231"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#aac2c5"},{"visibility":"on"}]}]

    //WY
    //styles = [{"featureType": "landscape", "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]}, {"featureType": "poi", "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]}, {"featureType": "road.highway", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "road.arterial", "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]}, {"featureType": "road.local", "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]}, {"featureType": "transit", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]}];

    //blue grey
    //styles = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]

    //Cleaner midnight
    //styles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"},{"weight":"0.20"},{"lightness":"28"},{"saturation":"23"},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#494949"},{"lightness":13},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]

    //Turquoise Water
    //styles = [{"stylers":[{"hue":"#16a085"},{"saturation":0}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]}];

    var mapOptions = {
        zoom: 15,
        center: initialLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    map.set('styles', styles); /* Change the theme. Refer https://snazzymaps.com for more*/

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
        });
    }

    // Create the DIV to hold the control and call the constructor passing in this DIV
    var geolocationDiv = document.createElement('divCenter');
    var geolocationControl = new GeolocationControl(geolocationDiv, map);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(geolocationDiv);
}

/*
    Initialize the firebase session or restore the session
*/
function initFirebase() {
    //Get the firebase session
    printShowUserNameSession();
}

/*
    Add a button on map for centering the location
*/
function GeolocationControl(controlDiv, map) {

    // Set CSS for the control button
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#444';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '1px';
    controlUI.style.borderColor = 'white';
    controlUI.style.height = '28px';
    controlUI.style.marginTop = '5px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to Center map on your Location';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control text
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '10px';
    controlText.style.color = 'white';
    controlText.style.paddingLeft = '10px';
    controlText.style.paddingRight = '10px';
    controlText.style.marginTop = '8px';
    controlText.innerHTML = 'Center Map';
    controlUI.appendChild(controlText);

    // Setup the click event listeners to geolocate user
    google.maps.event.addDomListener(controlUI, 'click', geolocate);
}

/*
    Center button click handler
*/
function geolocate() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function (position) {

            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            map.setZoom(14); // Back to default zoom
            map.panTo(pos); // Pan map to that position
            setTimeout("map.setZoom(15)", 1000); // Zoom in after 1 sec
        });
    }
}

/*
    Insert the firstname and lastname into the firebase database.
*/
function writeUserData(fname, lname) {
    var uid = getCurrentUID();
    if (uid != null && uid != '') {
        firebase.database().ref(uid).set({
            firstName: fname,
            lastName: lname
        });
    }
}

/*
    Restore the firebase session if any and print the user name 
*/
function printShowUserNameSession() {

    var user;
    user = localStorage.getItem('firebase:authUser:AIzaSyDLn_NOCXSeQNkFP60yjd6T0l2puITtt-U:[DEFAULT]');
    if (!user) {
        user = firebase.auth().currentUser;
    }

    //Store the data in local storage
    //if(!user)
    //    localStorage.setItem('firebaseUser', JSON.stringify(user));

    $('.tab-content input').each(function () {
        if (this != null)
            this.value = '';
    });

    if (user) {
        $('.divsignup').slideUp();
        $('.welcomeform').slideDown();

        //Get user first and last name
        printData();
        //alert(userdata);
        //console.log(userdata);
        //$('#username').text(fname + ' ' + lname);

    }
    else {
        $('.divsignup').slideDown();
        $('.welcomeform').slideUp();
    }
}

/*
    Get the current user's uid. Return null if no user logged in.
*/
function getCurrentUID() {
    var user = firebase.auth().currentUser;

    if (user) {
        // User is signed in.
        return user.uid;
    } else {
        // No user is signed in.
        return null;
    }
}

/*
    Restore the session using the localstorage
    or
    If a user is logged in, use the currentUser() to print the user name on screen
*/
function printData() {

    //Get data from localStorage
    var user = localStorage.getItem('firebase:authUser:AIzaSyDLn_NOCXSeQNkFP60yjd6T0l2puITtt-U:[DEFAULT]');
    var userObj;

    if (user) {
        userObj = $.parseJSON(user);
    }
    else {
        userObj = firebase.auth().currentUser;
    }
    var userid = userObj.uid;
    //Login user with 'uid'
    $.ajax({
        type: "POST",
        url: 'https://securetoken.googleapis.com/v1/token?key=AIzaSyDLn_NOCXSeQNkFP60yjd6T0l2puITtt-U',
        data: 'grant_type=refresh_token&refresh_token=' + userObj.stsTokenManager.refreshToken,
        success: function (data) {
            //alert('success');
            console.log(data);
        },
        error: function (error) {
            console.log(error);
        },
        dataType: 'json'
    });
    console.log(userid);

    firebase.database().ref(userid).once('value').then(function (snapshot) {
        if (snapshot.val() != null && snapshot.val() != '') {


            var firstname = snapshot.val().firstName;
            var lastname = snapshot.val().lastName;

            $('#username').text(firstname + ' ' + lastname);
        }
        else {
            $('#username').text("Guest");
        }
    }, function (error) {
        console.log(error);
    });
}

/*
    Load the region coordinates from firebase database and display regions on screen.
*/
function displayRegions() {
    //var userId = firebase.auth().currentUser.uid;

    polygons = [];

    var bounds = new google.maps.LatLngBounds();
    /*for (var i = 0; i < markers.length; i++) {
     bounds.extend(markers[i].getPosition());
    }*/


    firebase.database().ref('regions').once('value').then(function (snapshot) {
        //console.log(snapshot.val());
        var result = snapshot.val();
        for (var i = 0; i < result.length; i++) /* Loop for all regions */ {
            var regionCoords = [];
            for (var j = 0; j < result[i].length; j++) /* Loop for all lat-lng in a region */ {
                //console.log(result[i][j]);

                //Display the polygon on the map

                // Define the LatLng coordinates for the polygon's path.
                regionCoords.push(result[i][j]);

                bounds.extend(result[i][j]);

            }
            regionCoords.push(result[i][0]);

            // Construct the polygon.
            var polygon = new google.maps.Polygon({
                paths: regionCoords,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#FF0000',
                fillOpacity: 0.35
            });
            polygons.push(polygon);//.setMap(map);
        }
        for (var i = 0; i < polygons.length; i++) {
            map.fitBounds(bounds);
            polygons[i].setMap(map);

            // Add a listener for the click event.
            polygons[i].addListener('click', showArrays);


        };
    });
}

/*
    Reset the regions on the map.
*/
function removeRegions() {
    for (var i = 0; i < polygons.length; i++) {
        polygons[i].setMap(null);
    };
}

/*
    Show the array of coordinates of the polygons on click.    
*/
function showArrays(event) {
    // Since this polygon has only one path, we can call getPath() to return the
    // MVCArray of LatLngs.
    infoWindow = new google.maps.InfoWindow;
    var vertices = this.getPath();

    var contentString = '<b>Region Details</b><br>' +
        'You click on: <br>' + event.latLng.lat() + ', ' + event.latLng.lng() +
        '<br><br><b>Region Coordinates:</b>';

    // Iterate over the vertices.
    for (var i = 0; i < vertices.getLength() ; i++) {
        var xy = vertices.getAt(i);
        contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ', ' +
            xy.lng();
    }

    // Replace the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);

    infoWindow.open(map);
}