
$(document).ready(function () {
    var sevenDaysAgo;
    //initialize the leaflet map, set options and view
    var map = L.map('map', {
        zoomControl: false,
        scrollWheelZoom: false
    })
	.setView([39.7910, -86.1480], 6);

    var markers = new L.FeatureGroup();

    //add an OSM tileset as the base layer
    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    //call our getData() function.
    getData();

    //define a base icon
    var baseIcon = L.Icon.extend({
        options: {
            shadowUrl: 'img/shadow.png',

            iconSize: [32, 37], // size of the icon
            shadowSize: [51, 37], // size of the shadow
            iconAnchor: [16, 37], // point of the icon which will correspond to marker's location
            shadowAnchor: [25, 37],  // the same for the shadow
            popupAnchor: [1, -37] // point from which the popup should open relative to the iconAnchor
        }
    });

    //define agency icons based on the base icon
    // var tlcIcon = new baseIcon({ iconUrl: 'img/taxi.png' });
    // var dotIcon = new baseIcon({ iconUrl: 'img/dot.png' });
    // var parksIcon = new baseIcon({ iconUrl: 'img/parks.png' });
    // var buildingsIcon = new baseIcon({ iconUrl: 'img/buildings.png' });
    // var nypdIcon = new baseIcon({ iconUrl: 'img/nypd.png' });
    // var dsnyIcon = new baseIcon({ iconUrl: 'img/dsny.png' });
    // var fdnyIcon = new baseIcon({ iconUrl: 'img/fdny.png' });
    // var doeIcon = new baseIcon({ iconUrl: 'img/doe.png' });
    // var depIcon = new baseIcon({ iconUrl: 'img/dep.png' });
    // var dofIcon = new baseIcon({ iconUrl: 'img/dof.png' });
    // var dcaIcon = new baseIcon({ iconUrl: 'img/dca.png' });
    // var dohmhIcon = new baseIcon({ iconUrl: 'img/dohmh.png' });
    // var hpdIcon = new baseIcon({ iconUrl: 'img/hpd.png' });


    function getData() {
        //get map bounds from Leaflet
        var bbox = map.getBounds();
        //map.removeLayer(markers);
        markers.clearLayers();
        //create a SODA-ready bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon
        var sodaQueryBox = [bbox._northEast.lat, bbox._southWest.lng, bbox._southWest.lat, bbox._northEast.lng];

        //figure out what the date was 7 days ago
        var sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        $('#startDate').html(sevenDaysAgo.toDateString());

        function cleanDate(input) {
            return (input < 10) ? '0' + input : input;
        }

        //create a SODA-ready date string that looks like: 2014-11-01
        sevenDaysAgo = sevenDaysAgo.getFullYear()
			+ '-'
			+ cleanDate((sevenDaysAgo.getMonth() + 1))
			+ '-'
			+ cleanDate((sevenDaysAgo.getDate() + 1));

        //use jQuery's getJSON() to call the SODA API for NYC 311
        //concatenate sodaQueryBox and sevenDaysAgo to add a $where clause to the SODA endpoint
        $.getJSON(constructQuery(sevenDaysAgo, sodaQueryBox), function (data) {

                console.log(data)
			    //iterate over each row, add a marker to the map
			    for (var i = 0; i < data.length; i++) {

			        var marker = data[i];
			        var icon = new L.Icon.Default();
                    if(marker.location_1){

                        var markerItem = L.marker([marker.location_1.coordinates[1], marker.location_1.coordinates[0]], { icon: icon });
                        markerItem.bindPopup(
                                '<h4>' + marker.site + '</h4>'
                            );
                        markers.addLayer(markerItem);

                    }
			    }
			    map.addLayer(markers);

			})
    }

    function constructQuery(sevenDaysAgo, sodaQueryBox) {
        var originalstr = "https://socratadata.iot.in.gov/resource/6v98-qjgv.json?"

        var agency = $( "#nycAgency" ).val();
        var conditiion = $("#conditions_list").val();
        // if (agency.length != 0 && agency != "All") {
        //     originalstr = originalstr + "&agency=" + agency;
        // }
        // if (conditiion.length != 0 && conditiion != "All") {
        //     originalstr = originalstr + "&complaint_type=" + conditiion;
        // }

        console.log(originalstr);

        return originalstr;
    }

    map.on('dragend', function (e) {
        getData();
    });

    $('#nycAgency').on("change", function () {
        getData();
    });

    $("#conditions_list").on('change keyup paste', function () {
        getData();
    });
});
