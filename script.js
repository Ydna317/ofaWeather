let apiKey="3c8c1d9e76eadd902a53aa3ec8156094"
$(document).ready(function() {
  $("#search-button").on("click", function() {
    let findCity = $("#search-value").val();
    $("#search-value").val("");
    searchWeather(findCity);
  });
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });
  function makeRow(text) {
    let li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }
  function searchWeather(findCity) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + findCity + "&appid=3c8c1d9e76eadd902a53aa3ec8156094&units=imperial",
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(findCity) === -1) {
          history.push(findCity);
          window.localStorage.setItem("history", JSON.stringify(history));
          makeRow(findCity);
        }
        // clear any old content
        $("#today").empty();
        // create html content for current weather
        let title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        let card = $("<div>").addClass("card");
        let wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        let humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        let temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        let cardBody = $("<div>").addClass("card-body");
        let img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);
        // call follow-up api endpoints
        getForecast(findCity);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  function getForecast(findCity) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + findCity + "&appid=3c8c1d9e76eadd902a53aa3ec8156094&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
        // loop over all forecasts (by 3-hour increments)
        for (let i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            let col = $("<div>").addClass("col-md-2");
            let card = $("<div>").addClass("card bg-primary text-white");
            let body = $("<div>").addClass("card-body p-2");
            let title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            let img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            let p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            let p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=3c8c1d9e76eadd902a53aa3ec8156094&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        let uv = $("<p>").text("UV Index: ");
        let btn = $("<span>").addClass("btn btn-sm").text(data.value);
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }
  // get current history, if any
  let history = JSON.parse(window.localStorage.getItem("history")) || [];
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
  for (let i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
