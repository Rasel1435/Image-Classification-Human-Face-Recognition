Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Some Message",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  dz.on("complete", function (file) {
    let imageData = file.dataURL;

    var url = "http://127.0.0.1:5000/classify_image";

    $.post(
      url,
      {
        image_data: file.dataURL,
      },
      function (data, status) {
        console.log("Classification data:", data);
        console.log("Status:", status);

        if (!data || data.length == 0) {
          console.log("No classification data received or empty array.");
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#error").show();
          return;
        }

        let match = null;
        let bestScore = -1;

        for (let i = 0; i < data.length; ++i) {
          let maxScoreForThisClass = Math.max(...data[i].class_probability);
          if (maxScoreForThisClass > bestScore) {
            match = data[i];
            bestScore = maxScoreForThisClass;
          }
        }

        if (match) {
          console.log("Match found:", match);
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html($(`[data-player="${match.class}"`).html());
          let classDictionary = match.class_dictionary;

          for (let personName in classDictionary) {
            let index = classDictionary[personName];
            let probabilityScore = match.class_probability[index];
            let elementName = "#score_" + personName.replace(" ", "_"); // Replace space with underscore in IDs
            console.log("Element:", elementName);
            console.log("Probability score:", probabilityScore);
            $(elementName).html(probabilityScore.toFixed(2)); // rounding to 2 decimal places
          }
        }
      }
    );
  });

  $("#submitBtn").on("click", function (e) {
    dz.processQueue();
  });
}

$(document).ready(function () {
  console.log("Document ready!");
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();

  init();
});
